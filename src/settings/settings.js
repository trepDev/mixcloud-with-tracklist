/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */

function initialize () {
  chrome.storage.local.get(null, content => {
    handleTracklistOption(content.settings)
  })
  function handleTracklistOption (settings) {
    const radioShow = document.getElementById('show')
    const radioHide = document.getElementById('hide')

    radioShow.checked = true
    radioShow.addEventListener('click', () => {
      settings.trackNumber = true
      chrome.storage.local.set({'settings': settings})
    })
    radioHide.checked = false
    radioHide.addEventListener('click', () => {
      settings.trackNumber = false
      chrome.storage.local.set({'settings': settings})
    })
  }
}

initialize()
