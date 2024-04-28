/* global chrome */
const store = require('../store/store')

async function retrieveMixesData () {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, async (tabs) => {
      if (tabs.length > 0) {
        const pathsAndTitle = tabs.map((tab) => {
          const url = tab.url
          const title = tab.title
          const regex = /^\D*:\/\/\D+\.mixcloud\.com/
          return {
            path: decodeURIComponent(url.replace(regex, '')),
            title: title
          }
        })
        const mixesDataFromStore = new Promise((resolve, reject) => {
          return getMixesData(pathsAndTitle.map(pathAndtitle => pathAndtitle.path), 1, resolve, reject)
        })

        const mixPathAndTitleFromPlayer = await getRequestMixPathFromPlayer(tabs)

        try {
          const mixesData = await mixesDataFromStore
          const mixesDataforPopUp = {
            currentPlayedMixPath: mixPathAndTitleFromPlayer,
            mixesData: mixesData
          }
          console.log('data sent to popup')
          console.log(mixesDataforPopUp)
          resolve(mixesDataforPopUp)
        } catch (e) {
          console.error('Error on getTracklist : ' + e)
          resolve()
        }
      } else {
        resolve()
      }
    })
  })
}

async function getRequestMixPathFromPlayer (tabs) {
  let isMixPathFromPlayerFound = false
  let mixPathFromPlayer
  for (let i = 0; i < tabs.length && !isMixPathFromPlayerFound; i++) {
    mixPathFromPlayer = await requestMixPathFromPlayer(tabs[i])
    isMixPathFromPlayerFound = !!mixPathFromPlayer
  }
  return mixPathFromPlayer
}

async function requestMixPathFromPlayer (tab) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'requestMixPathFromPlayer'
      },
      (response) => {
        resolve(response)
      }
    )
  })
}

/**
 * Recursive function to handle asynchronicity between request's spy & tracklists display
 * @param path : mix path
 * @param counter : attempt counter for tracklist retrieval from store
 * @param resolve
 * @param reject
 * @returns {*} resolve(an array of mixesData or empty array)
 */
function getMixesData (paths, counter, resolve, reject) {
  if (counter > 3) {
    resolve([])
  }
  store.getMultipleMixData(paths).then((mixesData) => {
    if (mixesData.length === 0) {
      setTimeout(function () {
        getMixesData(paths, counter + 1, resolve, reject)
      }, 500)
    } else {
      store.getMultipleMixData(paths).then((mixesData) => resolve(mixesData))
    }
  })
}

module.exports = retrieveMixesData
