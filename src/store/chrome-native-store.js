/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global chrome */

function get (keys) {
  return chrome.storage.local.get(keys)
}

function set (object) {
  return chrome.storage.local.set(object)
}

module.exports = {
  get,
  set
}
