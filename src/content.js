/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */
/* global MutationObserver */

const graphQLFetcher = require('./utils/graphqlFetcher')
// svg from https://github.com/adlawson/mixcloud-tracklist
const tracklistDisplayer = require('./tracklistDisplay')

let currentPath = document.location.pathname
let unavailableButtonActivated = false
let tracklistMessageActivated = false
let firstMixcloudAccess = true

const mutationObserver = new MutationObserver(function (mutations) {
  if (firstMixcloudAccess) {
    firstMixcloudAccess = false
    chrome.storage.local.get(['isNofitiedMwtBroke'], (result) => {
      if (result.isNofitiedMwtBroke === false) {
        // TODO call background for notification
      }
    })
  }
  // Condition to avoid activate tracklist at each node mutation
  if (document.location.pathname !== currentPath) {
    currentPath = document.location.pathname
    unavailableButtonActivated = false
    tracklistMessageActivated = false
    tracklistDisplayer.deleteUnavailableButton()
  }

  const actionAsNode = document.querySelector('[class^="styles__NonExclusiveActions"]')

  if (!unavailableButtonActivated && actionAsNode) {
    unavailableButtonActivated = true
    tracklistDisplayer.unavailableTracklistButton()
  }

  const tracklistHeaderAsNodeTemp = document.querySelector('[class^="styles__TracklistHeading"]')
  if (!tracklistMessageActivated && tracklistHeaderAsNodeTemp) {
    tracklistMessageActivated = true
    setTimeout(() => {
      const tracklistHeaderAsNode = document.querySelector('[class^="styles__TracklistHeading"]')
      if (tracklistHeaderAsNode) {
        // Modifiez le contenu de l'élément
        tracklistHeaderAsNode.innerHTML = 'Tracklist (Extension is currently broke. A new version is coming soon. ' +
          'More info <a href="https://github.com/trepDev/mixcloud-with-tracklist/issues/33"> here </a>)'
      }
    }, 500)
  }
})

mutationObserver.observe(document.querySelector('#react-root'), {
  childList: true,
  subtree: true
})

/**
 * Get templates's data from background store & activate tracklist.
 * @param path : current path.
 */
function activateTracklist (path) {
  chrome.runtime.sendMessage(
    { path: decodeURIComponent(path) },
    (datas) => {
      tracklistDisplayer.start(datas)
    }
  )
}

// Listen Background asking to make request retrieving tracklist. Result (tracklist) is send to background (wich store it in store)
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === 'requestTracklist') {
      return handleRequestTracklist(message.variables, message.query, sender, sendResponse)
    } else if (message.action === 'updateTracklist') {
      return handleUpdateTracklist(message.tracklist, message.cloudcastPath, sender, sendResponse)
    }
  }
)

function handleRequestTracklist (variables, query, sender, sendResponse) {
  graphQLFetcher.fetch(variables, query).then(result => sendResponse(result)).catch(() => sendResponse(null))
  return true
}

function handleUpdateTracklist (tracklist, cloudcastPath, sender, sendResponse) {
  let responseMessage
  if (document.location.pathname === cloudcastPath) {
    tracklistDisplayer.updateTemplateTracklist(tracklist)
    responseMessage = 'Tracklist Template updated'
  } else {
    responseMessage = 'Tracklist Template not updated. Paths are different'
  }
  sendResponse(responseMessage)
  return true
}
