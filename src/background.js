/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
const store = require('./store')
/* global chrome */
/* global TextDecoder */

chrome.runtime.onInstalled.addListener(details => {
  chrome.browserAction.setPopup({ popup: './onboarding/onboarding.html'})
  if (details.reason === 'update') {
    chrome.storage.local.clear()
  }
})

/**
 * Unfortunately, I can't use https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData to directly get the tracklist's datas.
 * It totally broke mixcloud website behaviour.
 * So, I have to spy graphQL request to get variables/query and make my own request.
 */
chrome.webRequest.onBeforeRequest.addListener(graphQLListener,
  { urls: ['https://app.mixcloud.com/graphql'] }, ['requestBody']
)

function graphQLListener (spiedRequest) {
  const byteArray = new Uint8Array(spiedRequest.requestBody.raw[0].bytes)
  const decoder = new TextDecoder('utf-8')
  const payload = JSON.parse(decoder.decode(byteArray))

  // Not my own request  & Request for tracklist (without timestamp) & tracklist not already store >> call content script for request cloudcast
  if (payload.id !== 'MwT' && payload.query.includes('TracklistAudioPageQuery') &&
    !store.getCloudcastByPath('/' + payload.variables.lookup.username + '/' + payload.variables.lookup.slug + '/')) {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => requestCloudcast(tabs, payload.variables, payload.query, true))
    // Not my own request  & Request for tracklist (with timestamp) & tracklist with timestamps not already store >> call content script for request cloudcast
  } else if (payload.id !== 'MwT' && payload.query.includes('PlayerControlsQuery') && !store.hasTimestamps(payload.variables.cloudcastId)) {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => requestCloudcast(tabs, payload.variables, payload.query, false))
  }
}

/**
 * send request notification (to content script) & store tracklist.
 * If this tracklist is an updated old one. Notify contentScript for potential tracklist template update
 * @param tabs
 * @param requestVariables
 * @param query
 * @param useRequestVariablesforStore data to get tracklist path is not availaible is sometimes in request variable, sometimes in response.
 * So we have to indicate when use request variable.
 */
function requestCloudcast (tabs, requestVariables, query, useRequestVariablesforStore) {
  for (const tab of tabs) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'requestTracklist',
        variables: requestVariables,
        query: query
      },
      (response) => storeCloudcastAndNotifyIfTracklistUpdated(response, useRequestVariablesforStore ? requestVariables : null)
    )
  }
}

function storeCloudcastAndNotifyIfTracklistUpdated (response, requestVariables) {
  if (hasTracklistInMixcloudResponse(response)) {
    const cloudcastAlreadyInStore = !!store.getCloudcastById(response.xhrResponse.data.cloudcast.id)
    const dataStored = storeCloudcast(response, requestVariables)
    if (cloudcastAlreadyInStore) {
      const tracklist = new Promise((resolve, reject) => {
        return getTracklist(dataStored.cloudcastDatas.path, 1, resolve, reject)
      })
      tracklist.then((data) => notifyUpdatedPlaylist(data.tracklist, dataStored.cloudcastDatas.path))
    }
  }
}

function hasTracklistInMixcloudResponse (response) {
  return !!response && response.hasOwnProperty('xhrResponse') && !!response.xhrResponse &&
    response.xhrResponse.hasOwnProperty('data') && response.xhrResponse.data.hasOwnProperty('cloudcast') &&
    response.xhrResponse.data.cloudcast && !!response.xhrResponse.data.cloudcast.sections.length
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
        }
      )
    }
  })
}

function storeCloudcast (datas, queryVariables) {
  let username
  let slug
  if (queryVariables) {
    username = queryVariables.lookup.username
    slug = queryVariables.lookup.slug
  } else {
    username = datas.xhrResponse.data.cloudcast.owner.username
    slug = datas.xhrResponse.data.cloudcast.slug
  }

  const dataToStore = {
    cloudcastDatas: {
      id: datas.xhrResponse.data.cloudcast.id,
      path: '/' + username + '/' + slug + '/',
      cloudcast: datas.xhrResponse.data.cloudcast
    }
  }

  if (store.getCloudcastById(dataToStore.cloudcastDatas.id) && !store.hasTimestamps(dataToStore.cloudcastDatas.id)) {
    console.log('replacecloudCast ' + dataToStore.cloudcastDatas.path)
    store.replaceCloudcast(dataToStore.cloudcastDatas)
  } else {
    console.log('savecloudCast ' + dataToStore.cloudcastDatas.path)
    store.setData(dataToStore)
  }
  return dataToStore
}

// Listen content script asking tracklist
chrome.runtime.onMessage.addListener(popupListener)

function popupListener (request, send, sendResponse) {
  if (request.action === 'getTracklist') {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
      if (tabs.length > 0) {
        const url = tabs[0].url
        const regex = /^\D*:\/\/\D+\.mixcloud\.com/
        const path = url.replace(regex, '')
        const tracklist = new Promise((resolve, reject) => {
          return getTracklist(path, 1, resolve, reject)
        })
        tracklist.then((data) => {
          console.log('on va envoyé comme data à la popup')
          console.log(data)
          sendResponse(data)
        })
      }
    })
    return true
  }
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
  if (counter > 5) {
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
