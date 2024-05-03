/* global chrome */
const store = require('../store/store')

async function retrieveMixesData () {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, async (tabs) => {
      if (tabs.length > 0) {
        const pathsAndTitleFromTab = tabs.map((tab) => {
          const url = tab.url
          const title = tab.title
          const regex = /^\D*:\/\/\D+\.mixcloud\.com/
          return {
            path: decodeURIComponent(url.replace(regex, '')),
            title: title
          }
        })

        const mixPathAndTitleFromPlayer = await getRequestMixPathFromPlayer(tabs)
        const allPathsAndTitle = mergeAndSortFromTabAndFromPlayer(pathsAndTitleFromTab, mixPathAndTitleFromPlayer)

        const mixesDataFromStore = new Promise((resolve, reject) => {
          return getMixesData(allPathsAndTitle.map(pathAndtitle => pathAndtitle.path), 1, resolve, reject)
        })

        try {
          const mixesData = await mixesDataFromStore
          addTitleAndIsPlayingInMixesData(mixesData, allPathsAndTitle)

          console.log('data sent to popup')
          console.log(mixesData)
          resolve(mixesData)
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
      resolve(mixesData)
    }
  })
}

/**
 *  If mix from player is not in mixes list from tab, we add it in first position
 *  else we move the played mix in first position
 *
 * @param pathsAndTitleFromTab
 * @param mixPathAndTitleFromPlayer
 * @returns {PathAndTitle[]} All PathAndTitle with PathAndTitleFrom player at first position
 */
function mergeAndSortFromTabAndFromPlayer (pathsAndTitleFromTab, mixPathAndTitleFromPlayer) {
  const pathPlayerInPathFromTabIndex = pathsAndTitleFromTab.findIndex(pathAndtitle => pathAndtitle.path === mixPathAndTitleFromPlayer.mixPath)
  let allpathsAndTitle
  if (pathPlayerInPathFromTabIndex === -1) {
    allpathsAndTitle = [{
      path: mixPathAndTitleFromPlayer.mixPath,
      title: mixPathAndTitleFromPlayer.mixTitle
    }].concat(pathsAndTitleFromTab)
  } else {
    const mixPathAndTitleCurrentlyPlayed = pathsAndTitleFromTab[pathPlayerInPathFromTabIndex]
    allpathsAndTitle = [mixPathAndTitleCurrentlyPlayed].concat(
      pathsAndTitleFromTab.filter(pathAndtitle => pathAndtitle !== mixPathAndTitleCurrentlyPlayed)
    )
  }
  console.log('allpathsAndTitle', allpathsAndTitle)

  return allpathsAndTitle
}

function addTitleAndIsPlayingInMixesData (mixesData, allpathsAndTitle) {
  if (mixesData.length === allpathsAndTitle.length) {
    mixesData.forEach((data, index) => {
      data.title = allpathsAndTitle[index].title
      data.isPlaying = index === 0
    })
  } else {
    mixesData.forEach((data, index) => {
      const pathAndTitleFound = allpathsAndTitle.find(pathAndTitle => pathAndTitle.path === data.path)
      if (pathAndTitleFound) {
        data.title = pathAndTitleFound.title
        data.isPlaying = data.path === pathAndTitleFound.path && pathAndTitleFound === allpathsAndTitle[0]
      }
    })
  }
}

module.exports = retrieveMixesData
