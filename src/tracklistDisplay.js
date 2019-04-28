/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
let mustache = require('mustache')
let tracklistTemplate = require('./templates/tracklist.mst')
// svg from https://github.com/adlawson/mixcloud-tracklist
let buttonTemplate = require('./templates/tracklistButton.mst')

/**
 * Initialize & start display
 * @param {Object[]} datas : templates's datas (see store.js for data attributes)
 * @param show : init state for showing tracklist or not
 */
function start (datas, show) {
  let sectionNodes = document.getElementsByClassName('show-about-section')[0]
  if (!sectionNodes) {
    throw new Error('container for tracklist doesnt exist')
  }

  if (!datas.tracklist.length) {
    unavailableButton()
  } else {
    let tracklistHandler = initializeTracklist(datas, show)
    initializeButton(tracklistHandler, show)
  }
}

function initializeTracklist (datas, show) {
  let tracklistAsNode = htmlToNode(mustache.render(tracklistTemplate, datas))
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
    tracklistHandler = replace(tracklistParentAsNode, tracklistAsNode, tracklistDivAsNode)
  } else if (trackByAsNode) {
    // tracklist replace 'track By' section
    tracklistHandler = replace(sectionNodes, tracklistAsNode, trackByAsNode)
  } else if (tagsAsNode) {
    // tracklist insert before tags section
    tracklistHandler = insertBefore(tagsAsNode.parentNode, tracklistAsNode, tagsAsNode)
  } else if (chartAsNode) {
    // tracklist insert chart section
    tracklistHandler = insertBefore(chartAsNode.parentNode, tracklistAsNode, chartAsNode)
  } else {
    // no idea where put tracklist, so place in first position inside section node
    tracklistHandler = insertBefore(sectionNodes, tracklistAsNode, sectionNodes.childNodes[0])
  }
  if (show) {
    tracklistHandler.show()
  }
  return tracklistHandler
}

function initializeButton (tracklistHandler, show) {
  let actionAsNodes = document.getElementsByClassName('actions')[0]
  let optionAsNode = actionAsNodes.childNodes[actionAsNodes.childNodes.length - 1]
  let buttonAsNode = htmlToNode(mustache.render(buttonTemplate, {showHideLabel: show ? 'Hide Tracklist' : 'Show Tracklist'}))
  if (show) {
    buttonAsNode.classList.add('btn-toggled')
  }
  insertBefore(actionAsNodes, buttonAsNode, optionAsNode).show()
  buttonAsNode.onclick = () => switchDisplay(buttonAsNode, tracklistHandler.show, tracklistHandler.hide)
}

function unavailableButton () {
  let actionAsNodes = document.getElementsByClassName('actions')[0]
  let optionAsNode = actionAsNodes.childNodes[4]
  let buttonAsNode = htmlToNode(mustache.render(buttonTemplate, {showHideLabel: 'Tracklist unavailable'}))
  insertBefore(actionAsNodes, buttonAsNode, optionAsNode).show()
}

/**
 * Returns 2 functions show/hide. Switch beetween oldNode & newNode.
 */
function replace (container, newNode, oldNode) {
  let show = () => container.replaceChild(newNode, oldNode)
  let hide = () => container.replaceChild(oldNode, newNode)
  return {
    show,
    hide
  }
}

/**
 * Returns 2 functions show/hide. Put newNode before referenceNode. Or remove new node.
 */
function insertBefore (container, newNode, referenceNode) {
  let show = () => container.insertBefore(newNode, referenceNode)
  let hide = () => container.removeChild(newNode)
  return {
    show,
    hide
  }
}

/**
 * Handle button & tracklist behaviours.
 * @param {Node} button
 * @param {function()}show
 * @param {function()}hide
 */
function switchDisplay (button, show, hide) {
  if (button.classList.contains('btn-toggled')) {
    hide()
    button.classList.remove('btn-toggled')
    button.childNodes[1].textContent = 'Show Tracklist'
    button.setAttribute('data-tooltip', 'Show Tracklist')
  } else {
    show()
    button.classList.add('btn-toggled')
    button.childNodes[1].textContent = 'Hide Tracklist'
    button.setAttribute('data-tooltip', 'Hide Tracklist')
  }
}

function htmlToNode (html) {
  let temp = document.createElement('div')
  temp.insertAdjacentHTML('afterbegin', html)
  return temp.firstChild
}

module.exports = {
  start
}
