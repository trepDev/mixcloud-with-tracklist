/* global chrome */
const store = require('../store/store')

/**
 * Retrieves the Mixcloud tab and player, along with the corresponding mixes (in store),
 * in order to create the {@link MixViewModel} used by the view.
 *
 * @returns {Promise<MixViewModel|undefined>}
 */
async function getMixViewModels () {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: '*://*.mixcloud.com/*' }, async (tabs) => {
      if (tabs.length === 0) {
        resolve()
      } else {
        /** @type PathAndTitle[] */
        const pathsAndTitlesFromTabs = tabs.map((tab) => {
          const url = tab.url
          // We keep only the mix title. All text after by is not the title
          const title = tab.title.split('by')[0]
          const regex = /^\D*:\/\/\D+\.mixcloud\.com/
          return {
            path: decodeURIComponent(url.replace(regex, '')),
            title: title
          }
        })

        const pathAndTitleFromMixPlayer = await getPathAndTitleFromMixPlayer(tabs)
        let allPathsAndTitle
        if (pathAndTitleFromMixPlayer) {
          allPathsAndTitle = mergeAndSortFromTabAndFromPlayer(pathsAndTitlesFromTabs, pathAndTitleFromMixPlayer)
        } else {
          allPathsAndTitle = pathsAndTitlesFromTabs
        }

        const mixesFromStore = new Promise((resolve) => {
          getMixesFromStore(allPathsAndTitle.map(pathAndTitle => pathAndTitle.path), 1, resolve)
        })

        try {
          const mixes = await mixesFromStore
          const mixViewModels = createMixViewModel(mixes, allPathsAndTitle)

          console.log('data sent to popup', mixViewModels)
          resolve(mixViewModels)
        } catch (e) {
          console.error('Error on getTracklist', e)
          resolve()
        }
      }
    })
  })
}

/**
 * @param tabs
 * @returns {Promise<PathAndTitle | undefined>}
 */
async function getPathAndTitleFromMixPlayer (tabs) {
  let isMixPathFromPlayerFound = false
  let pathAndTitleFromMixPlayer
  for (let i = 0; i < tabs.length && !isMixPathFromPlayerFound; i++) {
    pathAndTitleFromMixPlayer = await callContentForPathAndTitleFromMixPlayer(tabs[i])
    isMixPathFromPlayerFound = !!pathAndTitleFromMixPlayer
  }
  return pathAndTitleFromMixPlayer
}

/**
 * @param tab
 * @returns {Promise<PathAndTitle | null>}
 */
async function callContentForPathAndTitleFromMixPlayer (tab) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'requestPathAndTitleFromMixPlayer'
      },
      (response) => {
        resolve(response)
      }
    )
  })
}

/**
 * A recursive function that handles asynchronicity between a request's spy mechanism and tracklist display.
 * It uses {@link resolve} to return the retrieved mixes.
 *
 * @param {string[]} paths - The paths corresponding to each mix.
 * @param {number} counter - The attempt counter for retrieving tracklists from the store.
 * @param {Function} resolve - Resolves with an array of {@link Mix} when the mixes are successfully retrieved.
 *                             Otherwise, after 3 failed attempts, it resolves with an empty array.
 */

function getMixesFromStore (paths, counter, resolve) {
  if (counter > 3) {
    resolve([])
  }
  store.getMultipleMixes(paths).then((mixes) => {
    if (mixes.length === 0) {
      setTimeout(function () {
        getMixesFromStore(paths, counter + 1, resolve)
      }, 500)
    } else {
      resolve(mixes)
    }
  })
}

/**
 *  If mix from player is not in mixes list from tab, we add it in first position
 *  else we just move the played mix in first position
 *
 * @param {PathAndTitle[]} pathsAndTitleFromTab
 * @param {PathAndTitle} pathAndTitleFromMixPlayer
 * @returns {PathAndTitle[]} All PathAndTitle with PathAndTitleFrom player at first position
 */
function mergeAndSortFromTabAndFromPlayer (pathsAndTitleFromTab, pathAndTitleFromMixPlayer) {
  const pathPlayerInPathFromTabIndex = pathsAndTitleFromTab.findIndex(pathAndtitle => pathAndtitle.path === pathAndTitleFromMixPlayer.path)
  let allpathsAndTitles
  if (pathPlayerInPathFromTabIndex === -1) {
    allpathsAndTitles = [pathAndTitleFromMixPlayer].concat(pathsAndTitleFromTab)
  } else {
    const mixPathAndTitleCurrentlyPlayed = pathsAndTitleFromTab[pathPlayerInPathFromTabIndex]
    allpathsAndTitles = [mixPathAndTitleCurrentlyPlayed].concat(
      pathsAndTitleFromTab.filter(pathAndtitle => pathAndtitle !== mixPathAndTitleCurrentlyPlayed)
    )
  }
  console.log('allpathsAndTitles', allpathsAndTitles)

  return allpathsAndTitles
}

/**
 * Create (and return) an array of MixViewModel.
 * Each MixViewModel contains the data for a tab in the popup view
 *
 * @param {Mix[]} mixes
 * @param {PathAndTitle[]} allpathsAndTitles
 * @returns {MixViewModel[]}
 */
function createMixViewModel (mixes, allpathsAndTitles) {
  let mixViewModels
  if (mixes.length === allpathsAndTitles.length) {
    mixViewModels = mixes.map((mix, index) => {
      return /** @type MixViewModel */ {
        title: allpathsAndTitles[index].title,
        isFromPlayer: index === 0,
        ...mix
      }
    })
  } else {
    mixViewModels = mixes.map((mix) => {
      const pathAndTitleFound = allpathsAndTitles.find(pathAndTitle => pathAndTitle.path === mix.path)
      /** @type MixViewModel */
      const mixViewModel = { title: '', isFromPlayer: false, ...mix }
      if (pathAndTitleFound) {
        mixViewModel.title = pathAndTitleFound.title
        mixViewModel.isFromPlayer = mix.path === pathAndTitleFound.path && pathAndTitleFound === allpathsAndTitles[0]
        return mixViewModel
      }
    })
  }

  return mixViewModels
}

module.exports = getMixViewModels
