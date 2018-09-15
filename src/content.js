/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */
/* global MutationObserver */

let graphQLFetcher = require('./graphqlFetcher')
// svg from https://github.com/adlawson/mixcloud-tracklist
let tracklistDisplayer = require('./tracklistDisplay')

let currentPath = document.location.pathname
let tracklistDisplayed = false

let mutationObserver = new MutationObserver(function (mutations) {
  // If user is logged
  if (!document.getElementsByClassName('user-actions guest')[0]) {
    if (document.location.pathname !== currentPath) {
      currentPath = document.location.pathname
      tracklistDisplayed = false
    }
    let sectionNode = document.getElementsByClassName('show-about-section')
    if (sectionNode.length !== 0 && !tracklistDisplayed) {
      tracklistDisplayed = true
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
  chrome.storage.local.get(['defaultTracklist'], settings => {
    chrome.runtime.sendMessage(
      {path: decodeURIComponent(path)},
      (tracklist) => {
        tracklistDisplayer.start(tracklist, settings.defaultTracklist)
      }
    )
  })
}

chrome.runtime.onMessage.addListener(
  (graphQLRequest, sender, sendResponse) => {
    graphQLFetcher.fetch(graphQLRequest.variables, graphQLRequest.query).then(result => sendResponse(result)).catch(() => sendResponse(null))
    return true
  }
)
