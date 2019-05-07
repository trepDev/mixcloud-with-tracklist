function htmlToNode (html) {
  let temp = document.createElement('div')
  temp.insertAdjacentHTML('afterbegin', html)
  return temp.firstChild
}

/**
 * Returns 2 functions show/hide. Switch beetween oldNode & newNode.
 */
function replace (container, newNode, oldNode) {
  let show = () => container.replaceChild(newNode, oldNode)
  let hide = () => container.replaceChild(oldNode, newNode)
  return {
    show,
    hide
  }
}

/**
 * Returns 2 functions show/hide. Put newNode before referenceNode. Or remove new node.
 */
function insertBefore (container, newNode, referenceNode) {
  let show = () => container.insertBefore(newNode, referenceNode)
  let hide = () => container.removeChild(newNode)
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
