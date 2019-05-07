/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
let domUtil = require('./utils/domUtil')

'use strict'
let mustache = require('mustache')
let tracklistTemplate = require('./templates/tracklist.mst')
// svg from https://github.com/adlawson/mixcloud-tracklist
let buttonTemplate = require('./templates/tracklistButton.mst')

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
      initializeTracklistButton(tracklistHandler)
      initiliazeTimeStampButton(datas)
    }
  }
}

function initializeTracklist (datas) {
  let tracklistAsNode = domUtil.htmlToNode(mustache.render(tracklistTemplate, datas))

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
    tracklistHandler = domUtil.replace(tracklistParentAsNode, tracklistAsNode, tracklistDivAsNode)
  } else if (trackByAsNode) {
    // tracklist replace 'track By' section
    tracklistHandler = domUtil.replace(sectionNodes, tracklistAsNode, trackByAsNode)
  } else if (tagsAsNode) {
    // tracklist insert before tags section
    tracklistHandler = domUtil.insertBefore(tagsAsNode.parentNode, tracklistAsNode, tagsAsNode)
  } else if (chartAsNode) {
    // tracklist insert chart section
    tracklistHandler = domUtil.insertBefore(chartAsNode.parentNode, tracklistAsNode, chartAsNode)
  } else {
    // no idea where put tracklist, so place in first position inside section node
    tracklistHandler = domUtil.insertBefore(sectionNodes, tracklistAsNode, sectionNodes.childNodes[0])
  }

  tracklistHandler.show()
  addPlayByTimestamp(datas)

  return tracklistHandler
}

function initializeTracklistButton (tracklistHandler) {
  let actionAsNode = document.getElementsByClassName('actions')[0]
  let optionAsNode = actionAsNode.childNodes[actionAsNode.childNodes.length - 1]
  let buttonAsNode = domUtil.htmlToNode(mustache.render(buttonTemplate, {showHideLabel: 'Hide Tracklist'}))
  buttonAsNode.classList.add('btn-toggled')
  domUtil.insertBefore(actionAsNode, buttonAsNode, optionAsNode).show()
  buttonAsNode.onclick = () => switchDisplayTracklist(buttonAsNode, tracklistHandler.show, tracklistHandler.hide)
}

function unavailableTracklistButton () {
  let actionAsNode = document.getElementsByClassName('actions')[0]
  let optionAsNode = actionAsNode.childNodes[actionAsNode.childNodes.length - 1]
  let buttonAsNode = domUtil.htmlToNode(mustache.render(buttonTemplate, {showHideLabel: 'Tracklist unavailable'}))
  domUtil.insertBefore(actionAsNode, buttonAsNode, optionAsNode).show()
}

/**
 * Handle button & tracklist behaviours.
 * @param {Node} button
 * @param {function()}show
 * @param {function()}hide
 */
function switchDisplayTracklist (button, show, hide) {
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

/**
 * Initialize Button (swtich between timeStamp & Track number)
 * @param datas
 */
function initiliazeTimeStampButton (datas) {
  const timestampsAsNode = document.getElementsByClassName('mwtTimestamp')
  const trackNumbersAsNode = document.getElementsByClassName('mwtTrackNumber')
  const numberTimeStampButton = document.getElementById('numberTimeStampButton')
  // Initialize initiale button & TrackNumber/timestamp display state
  numberTimeStampButton.textContent = datas.settings.trackNumber ? 'Show Time' : 'Show Track Number'
  if (datas.settings.trackNumber) {
    for (let i = 0; i < timestampsAsNode.length; i++) {
      timestampsAsNode[i].style.display = 'none'
    }
    for (let i = 0; i < trackNumbersAsNode.length; i++) {
      trackNumbersAsNode[i].style.display = 'inline'
    }
  } else {
    for (let i = 0; i < timestampsAsNode.length; i++) {
      timestampsAsNode[i].style.display = 'inline'
    }
    for (let i = 0; i < trackNumbersAsNode.length; i++) {
      trackNumbersAsNode[i].style.display = 'none'
    }
  }

  numberTimeStampButton.onclick = () => {
    if (numberTimeStampButton.textContent === 'Show Track Number') {
      for (let i = 0; i < timestampsAsNode.length; i++) {
        timestampsAsNode[i].style.display = 'none'
      }
      for (let i = 0; i < trackNumbersAsNode.length; i++) {
        trackNumbersAsNode[i].style.display = 'inline'
      }
      numberTimeStampButton.textContent = 'Show Time'
    } else {
      for (let i = 0; i < timestampsAsNode.length; i++) {
        timestampsAsNode[i].style.display = 'inline'
      }
      for (let i = 0; i < trackNumbersAsNode.length; i++) {
        trackNumbersAsNode[i].style.display = 'none'
      }
      numberTimeStampButton.textContent = 'Show Track Number'
    }
  }
}

/**
 * Add track play behaviour with click on displayed trackNumber or timestamp
 * @param datas
 */
function addPlayByTimestamp (datas) {
  function addOnClick (trackElement, timestamp) {
    trackElement.setAttribute('title', 'Play')
    trackElement.onclick = () => {
      // little hack to load information in bottom player (when mix didn't has been played yet).
      if (htmlPlayer.played.length === 0) {
        // If I use directly htmlPlayer variable, hack don't work
        document.getElementsByClassName('player-control')[0].click()
        document.getElementsByClassName('player-control')[0].click()
      }
      htmlPlayer.currentTime = timestamp
      if (htmlPlayer.paused) {
        // setTimeout >> following hack above
        setTimeout(() => htmlPlayer.play(), 50)
      }
    }
  }

  let htmlPlayer = document.getElementsByTagName('audio')[0]
  datas.tracklist.forEach((track) => {
    // If timestamp exist, we can put trackplay's feature
    if (track.timestamp !== null && track.timestamp !== undefined) {
      let timestampElement = document.getElementById('timestamp_' + track.timestamp)
      let trackNumberElement = document.getElementById('trackNumber_' + track.timestamp)
      addOnClick(timestampElement, track.timestamp)
      addOnClick(trackNumberElement, track.timestamp)
      timestampElement.style.cursor = 'pointer'
      trackNumberElement.style.cursor = 'pointer'
    }
  })
}

module.exports = {
  start
}
