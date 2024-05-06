'use strict'
/* global chrome */

import { createApp } from 'vue'
import Tracklist from '../templates/tracklist.vue'
import TracklistApp from '../templates/tracklistApp.vue'
import domUtil from '../utils/domUtil'

const retrieveMixesData = require('./retrieveMixesData')
let tracklistVue
let currentMixId

initializePopup()

window.addEventListener('beforeunload', function (event) {
  if (tracklistVue) {
    tracklistVue.$destroy()
    tracklistVue = null
  }
})

async function initializePopup () {
  const mixesDataforPopUp = await retrieveMixesData()

  const contentContainer = document.createElement('div')
  const tracklistContainer = document.createElement('div')
  tracklistContainer.id = 'tracklistContainer'
  contentContainer.appendChild(tracklistContainer)

  const popupContentPlaceholder = document.querySelector('[class^="to-replace"]')
  const tracklistParentContainerAsNode = popupContentPlaceholder.parentNode
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, contentContainer, popupContentPlaceholder)

  tracklistHandler.show()

  await initializeTemplate(mixesDataforPopUp)
}

async function initializeTemplate (mixesDataforPopUp) {
  if (!mixesDataforPopUp || mixesDataforPopUp.length === 0) {
    return initializeNoMixcloudTemplate()
  } else {
    return initializeTracklistVue(mixesDataforPopUp)
  }
}

function initializeTracklistVue (mixesData) {
  const ComponentClassTracklistVue = createApp(TracklistApp,
    { mixesData: mixesData, callContentToPlayTrack: callContentToPlayTrack })
  ComponentClassTracklistVue.component('Tracklist', Tracklist)
  ComponentClassTracklistVue.mount('#tracklistContainer')
}

function initializeNoMixcloudTemplate () {
  return new Promise((resolve) => {
    const url = chrome.runtime.getURL('templates/no-mixcloud.html')
    fetch(url)
      .then(response => response.text())
      .then(noMixcloudTemplate => {
        const div = document.createElement('div')
        div.innerHTML = noMixcloudTemplate.trim()
        resolve(div.firstChild)
      })
  })
}

function callContentToPlayTrack (timestamp, isFromPlayer) {
  if (hasTimestamp(timestamp) && isFromPlayer) {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, (tabs) => {
      // TODO probably handle better multitab
      for (const tab of tabs) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            action: 'playTrack',
            timestamp: timestamp
          }
        )
      }
    })
  }
}

function hasTimestamp (timestamp) {
  return timestamp !== null && timestamp !== undefined
}
