'use strict'
/* global chrome */

import { createApp } from 'vue'
import TracklistApp from './templates/tracklistApp.vue'
import Tracklist from './templates/tracklist.vue'
import NoMix from './templates/noMix.vue'
import BasicTracklist from './templates/basicTracklist.vue'

const retrieveMixesData = require('./retrieveMixesData')
let tracklistVue

initializePopup()

window.addEventListener('beforeunload', function (event) {
  if (tracklistVue) {
    tracklistVue.$el.remove()
    tracklistVue.$destroy()
    tracklistVue = null
  }
})

async function initializePopup () {
  const mixesDataforPopUp = await retrieveMixesData()
  await initializeTracklistVue(mixesDataforPopUp)
}

function initializeTracklistVue (mixesData) {
  const ComponentClassTracklistVue = createApp(TracklistApp,
    { mixesData: mixesData, callContentToPlayTrack: callContentToPlayTrack })
  ComponentClassTracklistVue.component('Tracklist', Tracklist)
  ComponentClassTracklistVue.component('NoMix', NoMix)
  ComponentClassTracklistVue.component('BasicTracklist', BasicTracklist)
  tracklistVue = ComponentClassTracklistVue.mount('#mwt-placeholder')
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
