'use strict'
/* global chrome */

import Vue from 'vue'
import Tracklist from '../templates/tracklist.vue'
import domUtil from '../utils/domUtil'

const retrieveMixesData = require('./retrieveMixesData')

const ComponentClassTracklistVue = Vue.extend(Tracklist)
let tracklistVue

initializePopup()

window.addEventListener('beforeunload', function (event) {
  if (tracklistVue) {
    tracklistVue.$destroy()
    tracklistVue = null
  }
})

async function initializePopup () {
  const mixesDataforPopUp = await retrieveMixesData()
  const popupElement = await initializeTemplate(mixesDataforPopUp)

  const popupContentAsNode = document.querySelector('[class^="to-replace"]')

  const tracklistParentContainerAsNode = popupContentAsNode.parentNode
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, popupElement, popupContentAsNode)

  tracklistHandler.show()

  return tracklistHandler
}

async function initializeTemplate (mixesDataforPopUp) {
  if (!mixesDataforPopUp) {
    return initializeNoMixcloudTemplate()
  } else if (mixesDataforPopUp.length) {
    return initializeTracklistVue(mixesDataforPopUp[0])
  } else {
    return initializeNoTracklistTemplate()
  }
}

function initializeTracklistVue (mixData) {
  tracklistVue = new ComponentClassTracklistVue()
  tracklistVue.tracklist = mixData.tracklist
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
function initializeNoTracklistTemplate () {
  return new Promise((resolve) => {
    const url = chrome.runtime.getURL('templates/no-tracklist.html')
    fetch(url)
      .then(response => response.text())
      .then(noTracklistTemplate => {
        const div = document.createElement('div')
        div.innerHTML = noTracklistTemplate.trim()
        resolve(div.firstChild)
      })
  })
}

function callContentToPlayTrack (timestamp) {
  if (hasTimestamp(timestamp)) {
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
