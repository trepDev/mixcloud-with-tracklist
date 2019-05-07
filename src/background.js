/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
let store = require('./store')
/* global chrome */
/* global TextDecoder */

// Set app setting: trackNumber is for showing track's number or timestamp by default
chrome.runtime.onInstalled.addListener(details => {
  console.log(details)
  const settings = {
    trackNumber: true
  }
  if (details.reason === 'install') {
    chrome.storage.local.set({'settings': settings})
  } else if (details.reason === 'update') {
    chrome.storage.local.remove('defaultTracklist')
    chrome.storage.local.set({'settings': settings})
  }
})

/**
 * Unfortunately, I can't use https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData to directly get the tracklist's datas.
 * It totally broke mixcloud website behaviour.
 * So, I have to spy graphQL request to get variables/query and make my own request.
 */
chrome.webRequest.onBeforeRequest.addListener(graphQLListener,
  {urls: ['https://www.mixcloud.com/graphql']}, ['requestBody']
)

function graphQLListener (spiedRequest) {
  let byteArray = new Uint8Array(spiedRequest.requestBody.raw[0].bytes)

  let decoder = new TextDecoder('utf-8')
  let payload = JSON.parse(decoder.decode(byteArray))
  // Request for tracklist & not my own request & tracklist not already store >> notify content script to request
  if (payload.query.includes('TrackSection') && payload.id !== 'MwT' && !store.getCloudcastById(payload.variables.id_0)) {
    // If request doesn't have startSeconds parameter, add it
    if (payload.query.search(/TrackSection {(.*)(startSeconds)(.*)}/) === -1) {
      let newQuery = payload.query.replace(/TrackSection {([a-zA-Z]+)+(,[a-zA-Z]*)*/, '$&' + ',startSeconds')
      payload.query = newQuery
    }

    chrome.tabs.query({url: '*://*.mixcloud.com/*'}, (tabs) => requestCloudcast(tabs, payload.variables, payload.query))
  }
}

/**
 * send request notification (to content script) & store tracklist
 * @param tabs
 * @param requestVariables
 * @param query
 */
function requestCloudcast (tabs, requestVariables, query) {
  for (var tab of tabs) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'requestTracklist',
        variables: requestVariables,
        query: query
      },
      storeCloudcast
    )
  }
}

function storeCloudcast (datas) {
  let cloudcastDatas = null
  if (!!datas && datas.hasOwnProperty('xhrResponse') && !!datas.xhrResponse &&
    datas.xhrResponse.hasOwnProperty('data') && datas.xhrResponse.data.hasOwnProperty('cloudcast')) {
    cloudcastDatas = {
      id: datas.xhrResponse.data.cloudcast.id,
      path: '/' + datas.xhrResponse.data.cloudcast.owner.username + '/' + datas.xhrResponse.data.cloudcast.slug + '/',
      cloudcast: datas.xhrResponse.data.cloudcast
    }
  }
  // If no tracklist, no need to save data
  if (cloudcastDatas && !!cloudcastDatas.cloudcast.sections.length) {
    store.setData(cloudcastDatas)
  }
}

// Listen content script asking tracklist
chrome.runtime.onMessage.addListener(mixPageListener)

function mixPageListener (request, send, sendResponse) {
  let tracklist = new Promise((resolve, reject) => {
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
    return resolve({tracklist: []})
  }
  if (!store.getCloudcastByPath(path)) {
    setTimeout(function () {
      getTracklist(path, counter + 1, resolve, reject)
    }, 500)
  } else {
    getSettings().then((settings) => {
      return resolve({tracklist: store.getTracklist(path), settings: settings})
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
