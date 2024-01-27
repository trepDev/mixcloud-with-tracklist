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
    chrome.storage.local.get(['onboarding'], (result) => {
      if (result.onboarding === true) {
        chrome.storage.local.set({ onboarding: false })
        setTimeout(askDisplayOnboarding, 1000)
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
        tracklistHeaderAsNode.innerHTML = 'Tracklist (Extension is currently broken. A new version is coming soon. ' +
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
function askDisplayOnboarding () {
  console.log('enter askDisplayOnboarding')
  chrome.runtime.sendMessage(
    { action: 'displayOnboarding' },
    (imgUrls) => {
      console.log('enter retour displayOnoarding')
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
          console.log('justBeforeShowModale')
          dialog.showModal()
        })
        .catch(error => {
          console.error('Une erreur s\'est produite :', error)
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
      // LEGACY >> Have to set a timeout else play on track don't work (SEEMS TO WORK WITHOUT IT NOW, BUT JUST IN CASE ...)
      setTimeout(() => {
        const audioPlayer = document.getElementsByTagName('audio')[0]
        if (audioPlayer) audioPlayer.currentTime = message.timestamp
      }, 200)
      sendResponse({})
    }
  }
)

function handleRequestTracklist (variables, query, sender, sendResponse) {
  graphQLFetcher.fetch(variables, query).then(result => sendResponse(result)).catch(() => sendResponse(null))
  return true
}
