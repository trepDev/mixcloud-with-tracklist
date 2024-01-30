'use strict'
/* global chrome */

import Vue from 'vue'
import Tracklist from '../templates/tracklist.vue'
import domUtil from '../utils/domUtil'

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
  const popupElement = await initializeTemplate()

  const popupContentAsNode = document.querySelector('[class^="to-replace"]')

  const tracklistParentContainerAsNode = popupContentAsNode.parentNode
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, popupElement, popupContentAsNode)

  tracklistHandler.show()

  return tracklistHandler
}

async function initializeTemplate () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'getTracklist'
    },
    (response) => {
      if (!response) {
        initializeNoMixcloudTemplate().then((htmlElement) => resolve(htmlElement))
      } else if (response.tracklist && response.tracklist.length) {
        resolve(initializeTracklistVue(response.tracklist))
      } else if (response.tracklist && !response.tracklist.length) {
        resolve(initializeNoTracklistTemplate())
      } else {
        resolve()
      }
    })
  })
}

function initializeTracklistVue (tracklist) {
  tracklistVue = new ComponentClassTracklistVue()
  tracklistVue.tracklist = tracklist
  tracklistVue.callContentToPlayTrack = callContentToPlayTrack
  tracklistVue.hasTimestamp = hasTimestamp
  tracklistVue.$mount()
  return tracklistVue.$el
}

function initializeNoMixcloudTemplate () {
  return new Promise((resolve) => {
    const url = chrome.extension.getURL('templates/no-mixcloud.html')
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
    const url = chrome.extension.getURL('templates/no-tracklist.html')
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
