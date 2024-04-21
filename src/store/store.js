/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

// native-store will following build context
// both used promise api but can't use the same namespace
// (FF is still in manifest v2 & chrome namespace don't work on promise API in manifest V2)
let nativeStore
if (__BUILD_CONTEXT__ === 'chrome') {
  nativeStore = chrome.storage.local
} else {
  nativeStore = browser.storage.local
}

function clear () {
  return nativeStore.clear()
}

async function setSettings (settings) {
  const storeResult = await nativeStore.get('settings')
  const currentSettings = storeResult && storeResult.settings ? storeResult.settings : {}
  Object.assign(currentSettings, settings)
  nativeStore.set({ settings: currentSettings })
}

async function getSettings () {
  const result = await nativeStore.get('settings')
  return result && result.settings ? result.settings : { }
}

/**
 * data format :
 * {
 *  id : cloudcast id
 *  path : mix path
 *  cloudcast : cloudcast data
 * }
 */

function saveIdToPath (id, path) {
  nativeStore.set({ [id]: path }).catch((e) => console.log('error on save id', e))
}

async function getCloudcastPathFromId (id) {
  const result = await nativeStore.get(id).catch((e) => undefined)
  if (Object.keys(result).length === 0 && result.constructor === Object) {
    return undefined
  } else {
    return result[id]
  }
}

async function getCloudcastByPath (path) {
  const result = await nativeStore.get(path).catch((e) => undefined)
  if (result === undefined || (Object.keys(result).length === 0 && result.constructor === Object)) {
    return undefined
  } else {
    return result[path]
  }
}
async function setTracklistData (data) {
  const storageKey = data.cloudcastDatas.path
  try {
    await nativeStore.set({ [storageKey]: data.cloudcastDatas })
  } catch (e) {
    console.error(`Error on save for tracklist ${storageKey}`, e)
    if (e.name && e.name.toLowerCase().includes('quota')) {
      const settings = await getSettings()
      await clear()
      await setSettings(settings)
      await nativeStore.set({ [storageKey]: data.cloudcastDatas })
    }
  }
}

async function getMultipleTracklist (paths) {
  if (paths.length > 1) {
    // remove duplicate
    paths = [...new Set(paths)]
  }
  const multipleTracklist = []
  for (const path of paths) {
    const tracklist = await getTracklist(path)
    if (tracklist) {
      multipleTracklist.push(tracklist)
    }
  }
  return multipleTracklist
}

async function getTracklist (path) {
  const result = await nativeStore.get(path).catch((e) => undefined)
  let tracklist
  if (result === undefined || (Object.keys(result).length === 0 && result.constructor === Object)) {
    tracklist = undefined
  } else {
    const sections = result[path].cloudcast.sections
    // use to know if formatting time for all track at xx:xx:xx or xx:xx (for templates's homogeneity)
    const keepHours = !isNaN(sections[sections.length - 1].startSeconds) && sections[sections.length - 1].startSeconds > 3600
    tracklist = sections.map((section, index) => {
      const track = {
        trackNumber: (index + 1) < 10 ? '0' + (index + 1) : '' + (index + 1),
        timestamp: section.startSeconds,
        time: setTime(section.startSeconds, keepHours),
        artistName: section.artistName === undefined ? 'unknow' : section.artistName,
        songName: section.artistName === undefined ? 'unknow' : section.songName
      }
      return track
    })
  }

  return tracklist
}

function setTime (seconds, keepHours) {
  let time
  if (seconds === null || seconds === undefined) {
    time = 'not provided'
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
  clear,
  setSettings,
  getSettings,
  saveIdToPath,
  getCloudcastPathFromId,
  getCloudcastByPath,
  setTracklistData,
  getTracklist,
  getMultipleTracklist
}
