/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */
/* global browser */
/* global __BUILD_CONTEXT__ */

// native-store will follow the build context
// Both use the Promise API but cannot share the same namespace
// (Firefox is still using Manifest V2, and the Chrome namespace does not support the Promise API in Manifest V2)
let nativeStore
if (__BUILD_CONTEXT__ === 'chrome') {
  nativeStore = chrome.storage.local
} else {
  nativeStore = browser.storage.local
}

function clear () {
  return nativeStore.clear()
}

/**
 * @param {Settings} settings
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if saving fails for reasons other than quota limitations
 */
async function setSettings (settings) {
  const storeResult = await nativeStore.get('settings')
  const currentSettings = storeResult && storeResult.settings ? storeResult.settings : {}
  Object.assign(currentSettings, settings)
  nativeStore.set({ settings: currentSettings })
}

/**
 * @returns {Promise<Settings>}
 */
async function getSettings () {
  const result = await nativeStore.get('settings')
  return result && result.settings ? result.settings : { }
}

/**
 * @param {string} id
 * @param {string} path
 */
function saveIdToPath (id, path) {
  nativeStore.set({ [id]: path }).catch((e) => console.log('error on save id', e))
}

/**
 * @param {string} id
 * @returns {Promise<undefined|string>}
 */
async function getMixPathFromId (id) {
  const result = await nativeStore.get(id).catch(() => undefined)
  if (Object.keys(result).length === 0 && result.constructor === Object) {
    return undefined
  } else {
    return result[id]
  }
}

/**
 * @param {string} path
 * @returns {Promise<undefined|Mix>}
 */
async function getMixByPath (path) {
  const result = await nativeStore.get(path).catch(() => undefined)
  if (result === undefined || (Object.keys(result).length === 0 && result.constructor === Object)) {
    return undefined
  } else {
    return result[path]
  }
}

/**
 * @param {Mix} mix
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if saving fails for reasons other than quota limitations
 *                   (quota limitation is handle inside this method)
 */
async function saveMix (mix) {
  const storageKey = mix.path
  try {
    await nativeStore.set({ [storageKey]: mix })
  } catch (e) {
    if (e.name && e.name.toLowerCase().includes('quota')) {
      console.error(`Quota Error on save for mix ${storageKey}`)
      const settings = await getSettings()
      await clear()
      await setSettings(settings)
      await nativeStore.set({ [storageKey]: mix })
    } else {
      throw e
    }
  }
}

/**
 * Returns all the mixes in the same order as the specified paths.
 *
 * @param {string[]} paths - An array of mix paths.
 * @returns {Promise<Mix[]>} A promise that resolves to an array of Mix objects.
 *                           Resolves with an empty array if an error occurs or if nothing is found.
 */
async function getMultipleMixes (paths) {
  const result = await nativeStore.get(paths).catch((e) => {
    console.error(e)
    return undefined
  })
  if (!result) {
    return []
  } else {
    // Chrome does not return results in the same order as the given paths.
    // Therefore, we need to sort them. Paths that yield no results are removed.
    return paths.filter(path => !!result[path]).map(path => result[path])
  }
}

module.exports = {
  clear,
  setSettings,
  getSettings,
  saveIdToPath,
  getMixPathFromId,
  getMixByPath,
  saveMix,
  getMultipleMixes
}
