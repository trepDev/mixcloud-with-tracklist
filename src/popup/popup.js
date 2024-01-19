'use strict'
/* global chrome */
/* global browser */

import Vue from 'vue'
import Tracklist from '../templates/tracklist.vue'
import domUtil from '../utils/domUtil'

const ComponentClassTracklistVue = Vue.extend(Tracklist)
let tracklistVue

async function initializeTracklist () {
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
  })
}

initializeTracklist()
