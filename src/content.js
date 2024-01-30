/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */
/* global MutationObserver */

const graphQLFetcher = require('./utils/graphqlFetcher')
// svg from https://github.com/adlawson/mixcloud-tracklist

let firstMixcloudAccess = true

const mutationObserver = new MutationObserver(function (mutations) {
  if (firstMixcloudAccess) {
    firstMixcloudAccess = false
    chrome.storage.local.get(['onboarding'], (result) => {
      if (result.onboarding === true) {
        chrome.storage.local.set({ onboarding: false })
        setTimeout(displayOnboarding, 1000)
      }
    })
  }
})

mutationObserver.observe(document.querySelector('#react-root'), {
  childList: true,
  subtree: true
})

/**
 * Display onBoarding.
 * Sending a message to the background to retrieve the image URL is necessary in the onboarding template.
 */
function displayOnboarding () {
  chrome.runtime.sendMessage(
    { action: 'displayOnboarding' },
    (imgUrls) => {
      const url = chrome.extension.getURL('onboarding/onboarding.html')
      fetch(url)
        .then(response => response.text())
        .then(onboardingTemplate => {
          document.body.insertAdjacentHTML('afterbegin', onboardingTemplate)
          const dialog = document.getElementById('mwt-dialog')
          const iconImg = document.getElementsByClassName('mwt-img-margin')[0]
          iconImg.setAttribute('src', imgUrls.urlIcon)

          const extIcon = document.getElementsByClassName('mwt-ext-icon')[0]
          if (extIcon) {
            extIcon.setAttribute('src', imgUrls.urlExtIcon)
          }

          const closeButton = document.getElementsByClassName('mwt-rounded-button')[0]
          closeButton.addEventListener('click', () => {
            dialog.close()
          })
          dialog.showModal()
        })
        .catch(error => {
          console.error('Error in retrieving onboarding.html :', error)
        })
    }
  )
}

// Listen Background asking to make request retrieving tracklist. Result (tracklist) is send to background (wich store it in store)
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === 'requestTracklist') {
      return handleRequestTracklist(message.variables, message.query, sender, sendResponse)
    } else if (message.action === 'playTrack') {
      handlePlayTrack(message.timestamp, sendResponse)
    }
  }
)

function handleRequestTracklist (variables, query, sender, sendResponse) {
  graphQLFetcher.fetch(variables, query).then(result => sendResponse(result)).catch((reason) => {
    console.error('Error on graphQLFetcher.fetch : ' + reason)
    sendResponse(null)
  })
  return true
}

function handlePlayTrack (timestamp, sendResponse) {
  // LEGACY >> Have to set a timeout else play on track don't work (SEEMS TO WORK WITHOUT IT NOW, BUT JUST IN CASE ...)
  setTimeout(() => {
    const audioPlayer = document.getElementsByTagName('audio')[0]
    if (audioPlayer) audioPlayer.currentTime = timestamp
  }, 200)
  sendResponse({})
  return true
}
