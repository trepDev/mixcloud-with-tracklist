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

async function setMixData (mixesData) {
  const storageKey = mixesData.path
  try {
    await nativeStore.set({ [storageKey]: mixesData })
  } catch (e) {
    console.error(`Error on save for mixData ${storageKey}`, e)
    if (e.name && e.name.toLowerCase().includes('quota')) {
      const settings = await getSettings()
      await clear()
      await setSettings(settings)
      await nativeStore.set({ [storageKey]: mixesData })
    }
  }
}

async function getMultipleMixData (paths) {
  if (paths.length > 1) {
    // remove duplicate
    paths = [...new Set(paths)]
  }
  const multipleMixData = []
  for (const path of paths) {
    const mixData = await getMixData(path)
    if (mixData) {
      multipleMixData.push(mixData)
    }
  }
  return multipleMixData
}

async function getMixData (path) {
  const result = await nativeStore.get(path).catch((e) => undefined)
  let tracklist
  if (result === undefined || (Object.keys(result).length === 0 && result.constructor === Object)) {
    tracklist = undefined
  } else {
    tracklist = result[path]
  }

  return tracklist
}

module.exports = {
  clear,
  setSettings,
  getSettings,
  saveIdToPath,
  getCloudcastPathFromId,
  getCloudcastByPath,
  setMixData,
  getMultipleMixData
}
