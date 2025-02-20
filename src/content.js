/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// svg from https://github.com/adlawson/mixcloud-tracklist

'use strict'
/* global chrome */
/* global __BUILD_CONTEXT__ */

const graphQLFetcher = require('./utils/graphqlFetcher')
const store = require('./store/store')

store.getSettings().then(settings => {
  if (settings.onboardingInstall === true) {
    settings.onboardingInstall = false
    store.setSettings(settings)
    setTimeout(() => displayOnboarding(true), 1000)
  } else if (settings.onboardingUpdate === true) {
    settings.onboardingUpdate = false
    store.setSettings(settings)
    setTimeout(() => displayOnboarding(false), 1000)
  }
})

function displayOnboarding (isInstall) {
  const urlIcon = chrome.runtime.getURL('icons/icon48.png')
  const urlExtIcon = chrome.runtime.getURL('onboarding/ext-icon.png')
  const url = isInstall ? chrome.runtime.getURL('onboarding/onboarding-install.html')
    : chrome.runtime.getURL('onboarding/onboarding-update.html')
  fetch(url)
    .then(response => response.text())
    .then(onboardingTemplate => {
      document.body.insertAdjacentHTML('afterbegin', onboardingTemplate)
      const dialog = document.getElementById('mwt-dialog')
      const iconImg = document.getElementsByClassName('mwt-img-margin')[0]
      iconImg.setAttribute('src', urlIcon)

      const extIcon = document.getElementsByClassName('mwt-ext-icon')[0]
      if (extIcon) {
        extIcon.setAttribute('src', urlExtIcon)
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

// Listen Background asking to make request retrieving tracklist.
// Result (cloudcast) is sent to background (which extract tracklist & some others information to store)
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === 'requestTracklist') {
      return handleRequestTracklist(message.variables, message.query, sender, sendResponse)
    } else if (message.action === 'playTrack') {
      handlePlayTrack(message.timestamp, sendResponse)
    } else if (message.action === 'requestPathAndTitleFromMixPlayer') {
      handleMixPathFromPlayer(sendResponse)
    }
  }
)

function handleRequestTracklist (variables, query, sender, sendResponse) {
  graphQLFetcher.fetch(variables, query).then(result => {
    sendResponse(result)
  }).catch((reason) => {
    console.error('Error on graphQLFetcher.fetch : ' + reason)
    sendResponse(null)
  })
  return true
}

function handlePlayTrack (timestamp, sendResponse) {
  let playTimeout = 200

  // Click on play button doesn't seem fully stable on Firefox, so we only do it for Chrome
  if (__BUILD_CONTEXT__ === 'chrome') {
    const playButtonPlayer = document.getElementsByClassName('styles__PlayerControl-css-in-js__sc-1o9kadp-1')
    if (playButtonPlayer.length === 1 && playButtonPlayer[0].getAttribute('aria-label') === 'Play') {
      playButtonPlayer[0].click()
      playTimeout = 500
    }
  }

  // LEGACY >> Have to set a timeout else play on track don't work (SEEMS TO WORK WITHOUT IT NOW, BUT JUST IN CASE ...)
  setTimeout(() => {
    const audioPlayer = document.getElementsByTagName('audio')[0]
    if (audioPlayer) audioPlayer.currentTime = timestamp
  }, playTimeout)
  sendResponse({})
  return true
}

function handleMixPathFromPlayer (sendResponse) {
  const mixAnchorElement = document.getElementsByClassName(
    'styles__PlainLink-css-in-js__sc-1fruqy3-2 PlayerControlsDetails__ShowTitle-css-in-js__sc-1h3465k-4')[0]

  const textAndHrefPart = {
    text: mixAnchorElement.firstChild.nodeValue,
    hrefParts: mixAnchorElement.href.replace('https://www.mixcloud.com/', '').split('/')
  }

  sendResponse(
    /** @type PathAndTitle */
    {
      path: '/' + textAndHrefPart.hrefParts[0] + '/' + textAndHrefPart.hrefParts[1] + '/',
      title: textAndHrefPart.text
    }
  )
  return true
}
