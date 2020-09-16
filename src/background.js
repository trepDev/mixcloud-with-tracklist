/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
const store = require('./store')
/* global chrome */
/* global TextDecoder */

// Set app setting: showTracklist by default
chrome.runtime.onInstalled.addListener(details => {
  console.log(details)
  const settings = {
    showTracklist: true
  }
  if (details.reason === 'install') {
    chrome.storage.local.set({ settings: settings })
  } else if (details.reason === 'update') {
    chrome.storage.local.clear()
    chrome.storage.local.set({ settings: settings })
  }
})

/**
 * Unfortunately, I can't use https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData to directly get the tracklist's datas.
 * It totally broke mixcloud website behaviour.
 * So, I have to spy graphQL request to get variables/query and make my own request.
 */
chrome.webRequest.onBeforeRequest.addListener(graphQLListener,
  { urls: ['https://www.mixcloud.com/graphql'] }, ['requestBody']
)

function graphQLListener (spiedRequest) {
  const byteArray = new Uint8Array(spiedRequest.requestBody.raw[0].bytes)
  const decoder = new TextDecoder('utf-8')
  const payload = JSON.parse(decoder.decode(byteArray))
  // Request for tracklist & not my own request & tracklist not already store >> call content script for request cloudcast
  if (payload.query.includes('TrackSection') && payload.id !== 'MwT' && !store.getCloudcastById(payload.variables.id_0) && !store.getCloudcastById(payload.variables.cloudcastId)) {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => requestCloudcast(tabs, payload.variables, payload.query, false))
    // Request for tracklist with timestamps & no ads request (this one include also startSeconds)
    // & not my own request & already store this cloudcast & cloudcast stored has not timestamps
    // >> call content script for request cloudcast then notify front to upgrade tracklist template
  } else if (payload.query.includes('startSeconds') && !payload.query.includes('fetchAudioAdsInfoQuery') &&
    payload.id !== 'MwT' && (!!store.getCloudcastById(payload.variables.id_0) || !!store.getCloudcastById(payload.variables.cloudcastId)) &&
    !store.hasTimestamps(payload.variables.id_0)) {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => requestCloudcast(tabs, payload.variables, payload.query, true))
  }
}

/**
 * send request notification (to content script) & store tracklist.
 * If this tracklist is an updated old one. Notify contentScript for potential tracklist template update
 * @param tabs
 * @param requestVariables
 * @param query
 * @param notifyTracklistUpdated : if true, call contentScript to update Tracklsit template (after getting new tracklist data)
 */
function requestCloudcast (tabs, requestVariables, query, notifyTracklistUpdated) {
  for (var tab of tabs) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'requestTracklist',
        variables: requestVariables,
        query: query
      },
      (response) => {
        const dataStored = storeCloudcast(response)
        if (notifyTracklistUpdated) {
          const tracklist = new Promise((resolve, reject) => {
            return getTracklist(dataStored.cloudcastDatas.path, 1, resolve, reject)
          })
          tracklist.then((data) => notifyUpdatedPlaylist(data.tracklist, dataStored.cloudcastDatas.path))
        }
      }
    )
  }
}

/**
 * Call contentScript to update tracklist template
 * @param tracklist: trackist data
 */
function notifyUpdatedPlaylist (tracklist, cloudcastPath) {
  chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'updateTracklist',
          tracklist: tracklist,
          cloudcastPath: cloudcastPath
        },
        console.log('pouet')
      )
    }
  })
}

function storeCloudcast (datas) {
  let dataToStore = null
  if (!!datas && datas.hasOwnProperty('xhrResponse') && !!datas.xhrResponse &&
    datas.xhrResponse.hasOwnProperty('data') && datas.xhrResponse.data.hasOwnProperty('cloudcast')) {
    dataToStore = {
      cloudcastDatas: {
        id: datas.xhrResponse.data.cloudcast.id,
        path: '/' + datas.xhrResponse.data.cloudcast.owner.username + '/' + datas.xhrResponse.data.cloudcast.slug + '/',
        cloudcast: datas.xhrResponse.data.cloudcast
      }
    }
  }
  // If no tracklist, no need to save data
  if (dataToStore.cloudcastDatas && !!dataToStore.cloudcastDatas.cloudcast.sections.length) {
    if (!store.hasTimestamps(dataToStore.cloudcastDatas.id)) {
      store.replaceCloudcast(dataToStore.cloudcastDatas)
    } else {
      store.setData(dataToStore)
    }
    return dataToStore
  }
}

// Listen content script asking tracklist
chrome.runtime.onMessage.addListener(mixPageListener)

function mixPageListener (request, send, sendResponse) {
  const tracklist = new Promise((resolve, reject) => {
    return getTracklist(request.path, 1, resolve, reject)
  })
  tracklist.then((data) => sendResponse(data))
  return true
}

/**
 * Recursive function to handle asynchronious between request's spy & tracklist display
 * @param path : mix path
 * @param counter : attempt counter for tracklist retrieval from store
 * @param resolve
 * @param reject
 * @returns {*} resolve(tracklist or emptry tracklist)
 */
function getTracklist (path, counter, resolve, reject) {
  if (counter > 10) {
    return resolve({ tracklist: [] })
  }
  if (!store.getCloudcastByPath(path)) {
    setTimeout(function () {
      getTracklist(path, counter + 1, resolve, reject)
    }, 500)
  } else {
    getSettings().then((settings) => {
      return resolve({ tracklist: store.getTracklist(path), settings: settings })
    })
  }
  function getSettings () {
    return new Promise((resolve) => {
      let settings = store.getSettings()
      if (settings) {
        resolve(settings)
      } else {
        chrome.storage.local.get(null, content => {
          settings = content.settings
          store.setSettings(content.settings)
          resolve(settings)
        })
      }
    })
  }
}
