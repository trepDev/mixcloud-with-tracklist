/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Vue from 'vue'
import TracklistButton from './templates/tracklistButton'
import Tracklist from './templates/tracklist'
import UnavailableTracklistButton from './templates/UnavailableTracklistButton'

let domUtil = require('./utils/domUtil')

'use strict'
// svg from https://github.com/adlawson/mixcloud-tracklist

/**
 * Initialize & start display
 * @param {Object[]} datas : templates's datas (see store.js for data attributes)
 */
function start (datas) {
  let sectionNodes = document.getElementsByClassName('show-about-section')[0]
  if (!sectionNodes) {
    throw new Error('container for tracklist doesnt exist')
  }

  if (!datas.tracklist.length) {
    unavailableTracklistButton()
  } else {
    if (document.getElementsByClassName('tracklist-table-row-header').length === 0) {
      let tracklistHandler = initializeTracklist(datas)
      initializeTracklistButton(tracklistHandler, datas)
    }
  }
}

function initializeTracklist (datas) {
  let ComponentClass = Vue.extend(Tracklist)
  let tracklistVue = new ComponentClass({
    data: datas
  })
  tracklistVue.$mount()

  let selectTracklistAsNode = document.getElementsByClassName('tracklist-wrap')[0]
  let sectionNodes = document.getElementsByClassName('show-about-section')[0]
  let trackByAsNode = document.getElementsByClassName('show-tracklist')[0]
  let chartAsNode = document.getElementsByClassName('chart-placement')[0]
  let tagsAsNode = document.getElementsByClassName('show-tags')[0]

  let tracklistHandler
  if (selectTracklistAsNode) {
    let tracklistDivAsNode = selectTracklistAsNode.parentNode
    let tracklistParentAsNode = tracklistDivAsNode.parentNode
    // tracklist replace 'tracklist exclusive (pay) profile' section
    tracklistHandler = domUtil.replace(tracklistParentAsNode, tracklistVue.$el, tracklistDivAsNode)
  } else if (trackByAsNode) {
    // tracklist replace 'track By' section
    tracklistHandler = domUtil.replace(sectionNodes, tracklistVue.$el, trackByAsNode)
  } else if (tagsAsNode) {
    // tracklist insert before tags section
    tracklistHandler = domUtil.insertBefore(tagsAsNode.parentNode, tracklistVue.$el, tagsAsNode)
  } else if (chartAsNode) {
    // tracklist insert chart section
    tracklistHandler = domUtil.insertBefore(chartAsNode.parentNode, tracklistVue.$el, chartAsNode)
  } else {
    // no idea where put tracklist, so place in first position inside section node
    tracklistHandler = domUtil.insertBefore(sectionNodes, tracklistVue.$el, sectionNodes.childNodes[0])
  }

  tracklistHandler.show()

  return tracklistHandler
}

function initializeTracklistButton (tracklistHandler, datas) {
  let actionAsNode = document.getElementsByClassName('actions')[0]
  let optionAsNode = actionAsNode.childNodes[actionAsNode.childNodes.length - 1]
  let ComponentClass = Vue.extend(TracklistButton)
  let buttonVue = new ComponentClass({
    data: datas
  })
  buttonVue.$mount()
  domUtil.insertBefore(actionAsNode, buttonVue.$el, optionAsNode).show()
  buttonVue.$el.onclick = () => switchDisplayTracklist(buttonVue, tracklistHandler.show, tracklistHandler.hide, datas)
}

function unavailableTracklistButton () {
  let actionAsNode = document.getElementsByClassName('actions')[0]
  let optionAsNode = actionAsNode.childNodes[actionAsNode.childNodes.length - 1]
  let ComponentClass = Vue.extend(UnavailableTracklistButton)
  let buttonVue = new ComponentClass()
  buttonVue.$mount()
  domUtil.insertBefore(actionAsNode, buttonVue.$el, optionAsNode).show()
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
  start
}
