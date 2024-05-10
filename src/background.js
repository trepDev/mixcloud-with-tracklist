/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */
/* global TextDecoder */

const store = require('./store/store')
const mixMapper = require('./utils/mixMapper')

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    store.setSettings({ onboardingInstall: true })
  } else if (details.reason === 'update') {
    store.clear().then(() => store.setSettings({ onboardingUpdate: true }))
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
    (response) => {
      if (hasCloudcast(response)) {
        storeCloudcast(response.xhrResponse.data.cloudcast,
          { username: requestVariables.lookup.username, slug: requestVariables.lookup.slug })
      }
    }
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
        storeCloudcast(response.xhrResponse.data.cloudcast,
          { username: response.xhrResponse.data.cloudcast.owner.username, slug: response.xhrResponse.data.cloudcast.slug })
      }
    }
  )
}

function hasCloudcast (response) {
  return !!response?.xhrResponse?.data?.cloudcast
}

function hasDataForPathInMixcloudResponse (response) {
  return !!response?.xhrResponse?.data?.cloudcast?.owner?.username &&
    !!response?.xhrResponse?.data?.cloudcast?.slug
}

async function storeCloudcast (cloudcast, usernameAndSlug) {
  const dataToStore = mixMapper.cloudcastToMixData(cloudcast, usernameAndSlug)

  if (!await store.getCloudcastPathFromId(dataToStore.id)) {
    store.saveIdToPath(dataToStore.id, dataToStore.path)
    console.log('savecloudCast ' + dataToStore.path)
    store.setMixData(dataToStore)
  }
}
