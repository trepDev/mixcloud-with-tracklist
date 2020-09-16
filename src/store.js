/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

/**
 * data format :
 * {
 *  id : cloudcast id
 *  path : mix path
 *  cloudcast : cloudcast data
 * }
 */
const store = {
  datas: [],
  settings: null
}

function getCloudcastById (id) {
  return store.datas.find((data) => data.id === id)
}

function getCloudcastByPath (path) {
  return store.datas.find((data) => data.path === path)
}

function hasTimestamps (id) {
  const data = getCloudcastById(id)
  return data ? data.cloudcast.sections.find((section) => section.startSeconds !== null && section.startSeconds !== undefined) !== undefined : false
}

function setData (data) {
  store.datas.push(data.cloudcastDatas)
}

function replaceCloudcast (newData) {
  const indexToReplace = store.datas.findIndex((data) => data.id === newData.id)
  store.datas.splice(indexToReplace, 1, newData)
}

function setSettings (settings) {
  store.settings = settings
}

function getSettings () {
  return store.settings
}

function getTracklist (path) {
  const data = store.datas.find((data) => data.path === path)
  const sections = data.cloudcast.sections
  // use to know if formatting time for all track at xx:xx:xx or xx:xx (for templates's homogeneity)
  const keepHours = !isNaN(sections[sections.length - 1].startSeconds) && sections[sections.length - 1].startSeconds > 3600
  const tracklist = sections.map((section, index) => {
    const track = {
      trackNumber: (index + 1) < 10 ? '0' + (index + 1) : '' + (index + 1),
      timestamp: section.startSeconds,
      time: setTime(section.startSeconds, keepHours),
      artistName: section.artistName === undefined ? 'unknow' : section.artistName,
      songName: section.artistName === undefined ? 'unknow' : section.songName
    }
    return track
  })

  return tracklist
}

function setTime (seconds, keepHours) {
  let time
  if (seconds === null || seconds === undefined) {
    time = 'no time'
  } else {
    time = timetoHHMMSS(seconds, keepHours)
  }
  return time
}

function timetoHHMMSS (time, keepHours) {
  var second = parseInt(time, 10)
  var hours = Math.floor(second / 3600) % 24
  var minutes = Math.floor(second / 60) % 60
  var seconds = second % 60
  return [hours, minutes, seconds]
    .map(v => v < 10 ? '0' + v : v)
    .filter((v, i) => {
      return keepHours === true ? true : (v !== '00' || i > 0)
    })
    .join(':')
}

module.exports = {
  getCloudcastById,
  getCloudcastByPath,
  hasTimestamps,
  setData,
  getTracklist,
  setSettings,
  getSettings,
  replaceCloudcast
}
