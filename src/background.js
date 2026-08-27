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
  { urls: ['https://app.mixcloud.com/graphql*'] }, ['requestBody']
)

async function graphQLListener (spiedRequest) {
  if (spiedRequest.requestBody) {
    const byteArray = new Uint8Array(spiedRequest.requestBody.raw[0].bytes)
    const decoder = new TextDecoder('utf-8')
    const payload = JSON.parse(decoder.decode(byteArray))

    // Not my own request  & Request for tracklist (with timestamp) & tracklist not already in store >> call content script to request cloudcast
    if (payload.id !== 'MwT' && spiedRequest.url.includes('localPlayerQueue__currentItem__cloudcast') && !await store.getMixPathFromId(payload.variables.id)) {
      chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
        if (tabs[0]) callContentForPlayerControlsQuery(tabs[0], spiedRequest.url, payload)
      })
    }
  }
}

function callContentForPlayerControlsQuery (tab, urlRequest, payload) {
  chrome.tabs.sendMessage(tab.id,
    {
      action: 'requestTracklist',
      urlRequest: urlRequest,
      payload: payload
    },
    (response) => {
      if (hasDataForPathInMixcloudResponse(response)) {
        storeCloudcast(response.xhrResponse.data.node,
          { username: response.xhrResponse.data.node.owner.username, slug: response.xhrResponse.data.node.slug })
      }
    }
  )
}

function hasDataForPathInMixcloudResponse (response) {
  return !!response?.xhrResponse?.data?.node?.owner?.username &&
    !!response?.xhrResponse?.data?.node?.slug
}

async function storeCloudcast (cloudcast, usernameAndSlug) {
  const mix = mixMapper.cloudcastToMix(cloudcast, usernameAndSlug)
  try {
    await store.saveMix(mix)
    await store.saveIdToPath(mix.id, mix.path)
    console.log('saveMix ' + mix.path)
  } catch (e) {
    console.error(`Error on save for mix ${mix.path}`, e)
  }
}
