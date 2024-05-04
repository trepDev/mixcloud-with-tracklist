'use strict'
/* global chrome */

import Vue from 'vue'
import Tracklist from '../templates/tracklist.vue'
import domUtil from '../utils/domUtil'

const retrieveMixesData = require('./retrieveMixesData')

const ComponentClassTracklistVue = Vue.extend(Tracklist)
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

  const header = document.createElement('nav')
  header.className = 'scrollable-header'
  mixesDataforPopUp.map(data => createTab(data)).forEach(tab => header.appendChild(tab))

  const tracklistTable = await initializeTemplate(mixesDataforPopUp)

  const contentContainer = document.createElement('div')
  contentContainer.appendChild(header)
  contentContainer.appendChild(tracklistTable)

  const popupContentPlaceholder = document.querySelector('[class^="to-replace"]')

  const tracklistParentContainerAsNode = popupContentPlaceholder.parentNode
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, contentContainer, popupContentPlaceholder)

  tracklistHandler.show()

  return tracklistHandler
}

function createTab (mixData) {
  const link = document.createElement('a')
  link.textContent = mixData.title
  link.id = mixData.id
  link.className = 'mix-title-header'
  link.onclick = () => {
    if (mixData.id !== currentMixId) {
      currentMixId = mixData.id
      tracklistVue.tracklist = mixData.tracklist
      tracklistVue.isFromPlayer = mixData.isFromPlayer
    }
  }
  return link
}

async function initializeTemplate (mixesDataforPopUp) {
  if (!mixesDataforPopUp || mixesDataforPopUp.length === 0) {
    return initializeNoMixcloudTemplate()
  } else {
    return initializeTracklistVue(mixesDataforPopUp[0])
  }
}

function initializeTracklistVue (mixData) {
  tracklistVue = new ComponentClassTracklistVue()
  tracklistVue.tracklist = mixData.tracklist
  tracklistVue.isFromPlayer = mixData.isFromPlayer
  tracklistVue.callContentToPlayTrack = callContentToPlayTrack
  tracklistVue.hasTimestamp = hasTimestamp
  tracklistVue.$mount()
  return tracklistVue.$el
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
