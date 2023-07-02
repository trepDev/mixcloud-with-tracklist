/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Vue from 'vue'
import TracklistButton from './templates/tracklistButton'
import Tracklist from './templates/tracklist'
import UnavailableTracklistButton from './templates/UnavailableTracklistButton'

const domUtil = require('./utils/domUtil')
const ComponentClassTracklistVue = Vue.extend(Tracklist)
let tracklistVue

'use strict'
// svg from https://github.com/adlawson/mixcloud-tracklist

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
  const ComponentClass = Vue.extend(TracklistButton)
  const buttonVue = new ComponentClass({
    data: { settings: datas.settings }
  })
  buttonVue.$mount()
  domUtil.insertAfter(actionAsNode, buttonVue.$el).show()
  buttonVue.$el.onclick = () => switchDisplayTracklist(buttonVue, tracklistHandler.show, tracklistHandler.hide, datas)
}

function unavailableTracklistButton () {
  const actionAsNode = document.querySelector('[class^="styles__NonExclusiveActions"]')
  const ComponentClass = Vue.extend(UnavailableTracklistButton)
  const buttonVue = new ComponentClass()
  buttonVue.$mount()
  domUtil.insertAfter(actionAsNode, buttonVue.$el).show()
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
  updateTemplateTracklist
}
