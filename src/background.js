/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */
/* global TextDecoder */

const store = require('./store/store')


chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ onboarding: false })
  } else if (details.reason === 'update') {
    try {
      chrome.storage.local.clear(() => chrome.storage.local.set({ onboarding: true }))
    } catch (e) {
      chrome.storage.local.set({ onboarding: true })
    }
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

chrome.runtime.onMessage.addListener(onMessageListener)

async function graphQLListener (spiedRequest) {
  if (spiedRequest.requestBody) {
    const byteArray = new Uint8Array(spiedRequest.requestBody.raw[0].bytes)
    const decoder = new TextDecoder('utf-8')
    const payload = JSON.parse(decoder.decode(byteArray))

    // Not my own request & Request for tracklist & tracklist not already store >> call content script to request cloudcast
    if (payload.id !== 'MwT' && payload.query.includes('TracklistAudioPageQuery') &&
      !await store.getCloudcastByPath('/' + payload.variables.lookup.username + '/' + payload.variables.lookup.slug + '/')) {
      chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
        if (tabs[0]) requestCloudcast(tabs[0], payload.variables)
      })
      // Not my own request  & Request for tracklist (with timestamp) & tracklist not already in store >> call content script for request cloudcast
    } else if (payload.id !== 'MwT' && payload.query.includes('PlayerControlsQuery') && !await store.getCloudcastPathFromId(payload.variables.cloudcastId)) {
      chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
        if (tabs[0]) requestPlayerControlsQuery(tabs[0], payload.variables, payload.query)
      })
    }
  }
}

/**
 * Send message to content script in order to retrieve tracklist.
 * Store tracklist if available in response.
 * @param tabs
 * @param requestVariables
 */
function requestCloudcast (tab, requestVariables) {
  chrome.tabs.sendMessage(
    tab.id,
    {
      action: 'requestTracklist',
      variables: requestVariables,
      // query made by mixcloud, but I add startSeconds to retrieve timestamp
      query: `
    query TracklistAudioPageQuery($lookup: CloudcastLookup!) {
        cloudcast: cloudcastLookup(lookup: $lookup) {
            canShowTracklist
            featuringArtistList
            moreFeaturingArtists
            sections {
                ... on TrackSection {
                    __typename
                    artistName
                    songName
                    startSeconds
                }
                ... on ChapterSection {
                    chapter
                }
            }
            id
        }
    }
`
    },
    (response) => checkAndStoreCloudcast(response,
      { username: requestVariables.lookup.username, slug: requestVariables.lookup.slug })
  )
}

function requestPlayerControlsQuery (tab, requestVariables, query) {
  chrome.tabs.sendMessage(tab.id,
    {
      action: 'requestTracklist',
      variables: requestVariables,
      query: query
    },
    (response) => {
      if (hasDataForPathInMixcloudResponse(response)) {
        checkAndStoreCloudcast(response,
          { username: response.xhrResponse.data.cloudcast.owner.username, slug: response.xhrResponse.data.cloudcast.slug })
      }
    }
  )
}

function checkAndStoreCloudcast (response, usernameAndSlug) {
  if (hasTracklistInMixcloudResponse(response)) {
    storeCloudcast(response, usernameAndSlug)
  }
}

function hasDataForPathInMixcloudResponse (response) {
  return !!response && response.hasOwnProperty('xhrResponse') && !!response.xhrResponse &&
    response.xhrResponse.hasOwnProperty('data') && response.xhrResponse.data.hasOwnProperty('cloudcast') &&
    response.xhrResponse.data.cloudcast && response.xhrResponse.data.cloudcast.hasOwnProperty('owner') &&
    !!response.xhrResponse.data.cloudcast.owner && response.xhrResponse.data.cloudcast.owner.hasOwnProperty('username') &&
    !!response.xhrResponse.data.cloudcast.owner.username && response.xhrResponse.data.cloudcast.hasOwnProperty('slug') &&
    !!response.xhrResponse.data.cloudcast.slug
}

function hasTracklistInMixcloudResponse (response) {
  return !!response && response.hasOwnProperty('xhrResponse') && !!response.xhrResponse &&
    response.xhrResponse.hasOwnProperty('data') && response.xhrResponse.data.hasOwnProperty('cloudcast') &&
    response.xhrResponse.data.cloudcast && response.xhrResponse.data.cloudcast.hasOwnProperty('sections') &&
    !!response.xhrResponse.data.cloudcast.sections.length
}

async function storeCloudcast (datas, usernameAndSlug) {
  const dataToStore = {
    cloudcastDatas: {
      id: datas.xhrResponse.data.cloudcast.id,
      path: '/' + usernameAndSlug.username + '/' + usernameAndSlug.slug + '/',
      cloudcast: datas.xhrResponse.data.cloudcast
    }
  }

  if (!await store.getCloudcastPathFromId(dataToStore.cloudcastDatas.id)) {
    store.saveIdToPath(dataToStore.cloudcastDatas.id, dataToStore.cloudcastDatas.path)
    console.log('savecloudCast ' + dataToStore.cloudcastDatas.path)
    store.setData(dataToStore)
  }

  return dataToStore
}

function onMessageListener (request, send, sendResponse) {
  if (request.action === 'getTracklist') {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
      if (tabs.length > 0) {
        const url = tabs[0].url
        const regex = /^\D*:\/\/\D+\.mixcloud\.com/
        const path = decodeURIComponent(url.replace(regex, ''))
        const tracklist = new Promise((resolve, reject) => {
          return getTracklist(path, 1, resolve, reject)
        })
        tracklist.then((data) => {
          console.log('data sent to popup')
          console.log(data)
          sendResponse(data)
        }).catch((reason) => {
          console.error('Error on getTracklist : ' + reason)
          sendResponse()
        })
      } else {
        sendResponse()
      }
    })
    return true
  } else if (request.action === 'displayOnboarding') {
    const urlIcon = chrome.runtime.getURL('icons/icon48.png')
    const urlExtIcon = chrome.runtime.getURL('onboarding/ext-icon.png')
    sendResponse({ urlIcon: urlIcon, urlExtIcon: urlExtIcon })
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
  if (counter > 3) {
    resolve({ tracklist: [] })
  }
  store.getCloudcastByPath(path).then((cloudcast) => {
    if (!cloudcast) {
      setTimeout(function () {
        getTracklist(path, counter + 1, resolve, reject)
      }, 500)
    } else {
      store.getTracklist(path).then((tracklist) => resolve({ tracklist: tracklist }))
    }
  })

}
