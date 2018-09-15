/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

/**
 * data format :
 * {
 *  id : cloudcast id
 *  path : mix path
 *  tracklist : tracklist to display
 * }
 */
let store = {
  datas: []
}

function getCloudcastById (id) {
  return store.datas.find((data) => data.id === id)
}

function getCloudcastByPath (path) {
  return store.datas.find((data) => data.path === path)
}

function setData (data) {
  store.datas.push(data)
}

function getTracklist (path) {
  let data = store.datas.find((data) => data.path === path)
  let sections = data.cloudcast.sections
  let tracklist = sections.map((section, index) => {
    let track = {
      trackNumber: index + 1,
      startSeconds: section.startSeconds,
      artistName: section.artistName === undefined ? 'unavailable' : section.artistName,
      songName: section.artistName === undefined ? 'unavailable' : section.songName
    }
    return track
  })
  return tracklist
}

module.exports = {
  getCloudcastById,
  getCloudcastByPath,
  setData,
  getTracklist
}
