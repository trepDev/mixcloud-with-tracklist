/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
/* global browser */
/* global content */
/* global XMLHttpRequest */
// firefox needs 'content' namespace to have Origin & Referer. Chrome didn't know 'browser' & 'content'

try {
  browser // eslint-disable-line no-unused-expression
  XMLHttpRequest = content.XMLHttpRequest // eslint-disable-line no-global assign
} catch (error) {
  // nothing to do
}

function fetch (variables, query) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open('POST', '/graphql')
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
        cloudcastId: variables.id_0,
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
  let value = '; ' + document.cookie
  let parts = value.split('; ' + name + '=')
  if (parts.length === 2) return parts.pop().split(';').shift()
}

module.exports = {
  fetch
}
