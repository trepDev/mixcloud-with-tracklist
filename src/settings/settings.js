/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global chrome */

function initialize () {
  chrome.storage.local.get(null, content => {
    handleTracklistOption(content.defaultTracklist)
  })
  function handleTracklistOption (defaultTracklist) {
    const radioShow = document.getElementById('show')
    const radioHide = document.getElementById('hide')

    radioShow.checked = defaultTracklist
    radioShow.addEventListener('click', () => chrome.storage.local.set({'defaultTracklist': true}))
    radioHide.checked = !defaultTracklist
    radioHide.addEventListener('click', () => chrome.storage.local.set({'defaultTracklist': false}))
  }
}

initialize()
