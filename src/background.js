/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
let store = require('./store')
/* global chrome */
/* global TextDecoder */

// Set app setting: defaultTracklist is for showing or hidding tracklist by default
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.storage.local.get(null, content => {
      if (content.defaultTracklist === undefined) {
        chrome.storage.local.set({'defaultTracklist': true})
      }
    })
  }
})

/**
 * Spy graphQL request to get variables/query and make my own request.
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
    return resolve({tracklist: store.getTracklist(path)})
  }
}
