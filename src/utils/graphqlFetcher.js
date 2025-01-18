/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global content */
/* global XMLHttpRequest */
/* global __BUILD_CONTEXT__ */

// Firefox with manifest V2 needs 'content' namespace to have Origin & Referer.
// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
if (__BUILD_CONTEXT__ === 'ff') {
  // eslint-disable-next-line no-global-assign
  XMLHttpRequest = content.XMLHttpRequest
}

function fetch (variables, query) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open('POST', 'https://app.mixcloud.com/graphql')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'))
    xhr.withCredentials = true

    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status !== 200) {
          reject(new Error('response status:' + xhr.status + ' (' + xhr.statusText + ')'))
        }
      }
    }

    xhr.onload = function () {
      resolve({
        xhrResponse: xhr.response
      })
    }

    xhr.send(JSON.stringify({
      id: 'MwT',
      query: query,
      variables: variables
    }))
  })
}

function getCookie (name) {
  const value = '; ' + document.cookie
  const parts = value.split('; ' + name + '=')
  if (parts.length === 2) return parts.pop().split(';').shift()
}

module.exports = {
  fetch
}
