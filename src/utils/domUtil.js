/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
function htmlToNode (html) {
  const temp = document.createElement('div')
  temp.insertAdjacentHTML('afterbegin', html)
  return temp.firstChild
}

/**
 * Returns 2 functions show/hide. Switch beetween oldNode & newNode.
 */
function replace (container, newNode, oldNode) {
  const show = () => container.replaceChild(newNode, oldNode)
  const hide = () => container.replaceChild(oldNode, newNode)
  return {
    show,
    hide
  }
}

/**
 * Returns 2 functions show/hide. Put newNode before referenceNode. Or remove new node.
 */
function insertBefore (container, newNode, referenceNode) {
  const show = () => container.insertBefore(newNode, referenceNode)
  const hide = () => container.removeChild(newNode)
  return {
    show,
    hide
  }
}

module.exports = {
  htmlToNode,
  replace,
  insertBefore
}
