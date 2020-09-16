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
let tracklistActivated = false

const mutationObserver = new MutationObserver(function (mutations) {
  // If user is logged
  if (!document.getElementsByClassName('user-actions guest')[0]) {
    // Condition to avoid activate tracklist at each node mutation
    if (document.location.pathname !== currentPath) {
      currentPath = document.location.pathname
      tracklistActivated = false
    }
    const sectionNode = document.getElementsByClassName('show-about-section')
    if (sectionNode.length !== 0 && !tracklistActivated && !document.getElementById('toogleTracklist')) {
      tracklistActivated = true
      activateTracklist(currentPath)
    }
  }
})

mutationObserver.observe(document.querySelector('section.cf'), {
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
