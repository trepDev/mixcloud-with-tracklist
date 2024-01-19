'use strict'
/* global chrome */
/* global browser */

import Vue from 'vue'
import Tracklist from '../templates/tracklist.vue'
import domUtil from '../utils/domUtil'

const ComponentClassTracklistVue = Vue.extend(Tracklist)
let tracklistVue

initializeTracklist()

window.addEventListener('beforeunload', function (event) {
  if (tracklistVue) {
    tracklistVue.$destroy()
  }
})

function initializeTracklist () {
  tracklistVue = new ComponentClassTracklistVue()
  // TODO handle async ?
  getData()
  tracklistVue.$mount()

  const tracklistHeaderAsNode = document.querySelector('[class^="hidden"]')

  const tracklistParentContainerAsNode = tracklistHeaderAsNode.parentNode
  const tracklistAsNode = tracklistParentContainerAsNode.childNodes[1]
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, tracklistVue.$el, tracklistAsNode)

  tracklistHandler.show()

  return tracklistHandler
}

function getData () {
  chrome.runtime.sendMessage({
    action: 'getTracklist'
  },
  (response) => {
    tracklistVue.tracklist = response.tracklist
    tracklistVue.callContentToPlayTrack = callContentToPlayTrack
    tracklistVue.hasTimestamp = hasTimestamp
  })
}

function callContentToPlayTrack (timestamp) {
  if (hasTimestamp(timestamp) && timestamp !== 0) {
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
  return timestamp !== null && timestamp !== undefined && timestamp !== 0
}
