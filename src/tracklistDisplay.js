/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Vue from 'vue'
import TracklistButton from './templates/tracklistButton'
import Tracklist from './templates/tracklist'
import UnavailableTracklistButton from './templates/UnavailableTracklistButton'

const domUtil = require('./utils/domUtil')
const ComponentClassTracklistVue = Vue.extend(Tracklist)
const ComponentClassTracklistButtonVue = Vue.extend(TracklistButton)
const ComponentClassTracklistButtonUnavailableVue = Vue.extend(UnavailableTracklistButton)
let tracklistVue
let tracklistButtonVue
let tracklistButtonUnavailableVue

'use strict'
// svg from https://github.com/adlawson/mixcloud-tracklist

function deleteUnavailableButton () {
  if (tracklistButtonUnavailableVue !== undefined && tracklistButtonUnavailableVue.$el !== undefined) {
    const parentElement = tracklistButtonUnavailableVue.$el.parentNode
    if (parentElement != null) {
      parentElement.removeChild(tracklistButtonUnavailableVue.$el)
    }
    tracklistButtonUnavailableVue.$destroy()
    tracklistButtonUnavailableVue = undefined
  }
}

/**
 * Initialize & start display
 * @param {Object[]} datas : templates's datas (see store.js for data attributes)
 */
function start (datas) {
  if (tracklistVue !== undefined) tracklistVue.$destroy()
  tracklistVue = new ComponentClassTracklistVue()
  const audioHeaderNode = document.querySelector('[class^="Layouts__RightSidebarLayout"]')
  if (!audioHeaderNode) {
    throw new Error('container for tracklist doesnt exist')
  }

  if (!datas.tracklist.length) {
    unavailableTracklistButton()
  } else {
    if (document.getElementsByClassName('tracklist-table-row-header').length === 0) {
      const tracklistHandler = initializeTracklist(datas)
      initializeTracklistButton(tracklistHandler, datas)
    }
  }
}

function updateTemplateTracklist (tracklist) {
  tracklistVue.tracklist = tracklist
}

function initializeTracklist (datas) {
  updateTemplateTracklist(datas.tracklist)
  tracklistVue.$mount()

  const tracklistHeaderAsNode = document.querySelector('[class^="styles__TracklistHeading"]')

  const tracklistParentContainerAsNode = tracklistHeaderAsNode.parentNode
  const tracklistAsNode = tracklistParentContainerAsNode.childNodes[1]
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, tracklistVue.$el, tracklistAsNode)

  if (datas.settings.showTracklist) {
    tracklistHandler.show()
  }

  return tracklistHandler
}

function initializeTracklistButton (tracklistHandler, datas) {
  const actionAsNode = document.querySelector('[class^="styles__NonExclusiveActions"]')
  tracklistButtonVue = new ComponentClassTracklistButtonVue({
    data: { settings: datas.settings }
  })
  tracklistButtonVue.$mount()
  domUtil.insertAfter(actionAsNode, tracklistButtonVue.$el).show()
  tracklistButtonVue.$el.onclick = () => switchDisplayTracklist(tracklistButtonVue, tracklistHandler.show, tracklistHandler.hide, datas)
}

function unavailableTracklistButton () {
  const actionAsNode = document.querySelector('[class^="styles__NonExclusiveActions"]')
  tracklistButtonUnavailableVue = new ComponentClassTracklistButtonUnavailableVue()
  tracklistButtonUnavailableVue.$mount()
  domUtil.insertAfter(actionAsNode, tracklistButtonUnavailableVue.$el).show()
}

/**
 * Handle button & tracklist behaviours.
 * @param {Node} button
 * @param {function()}show
 * @param {function()}hide
 */
function switchDisplayTracklist (button, show, hide, datas) {
  datas.settings.showTracklist = !datas.settings.showTracklist
  if (!datas.settings.showTracklist) {
    hide()
    button.$el.setAttribute('data-tooltip', 'Show Tracklist')
  } else {
    show()
    button.$el.setAttribute('data-tooltip', 'Hide Tracklist')
  }
}

export {
  start,
  updateTemplateTracklist,
  unavailableTracklistButton,
  deleteUnavailableButton
}
