/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global browser */
/* global content */
/* global XMLHttpRequest */
// Firefox with manifest V2 needs 'content' namespace to have Origin & Referer.
// Chrome didn't know 'browser' & 'content'
// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch

try {
  browser // eslint-disable-line no-unused-expression
  XMLHttpRequest = content.XMLHttpRequest // eslint-disable-line no-global assign
} catch (error) {
  // nothing to do
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

    xhr.onreadystatechange = function (event) {
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
