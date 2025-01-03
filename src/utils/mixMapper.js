/**
 * @param cloudcast
 * @param usernameAndSlug
 * @returns {Mix} - Mix
 */
function cloudcastToMix (cloudcast, usernameAndSlug) {
  const isDataInsideChapter = isDataInChapter(cloudcast.sections)

  /** @type TrackInfo[] **/
  let tracklist = []
  if (cloudcast.sections && cloudcast.sections.length > 0) {
    tracklist = isDataInsideChapter ? sectionsToBasicTracklist(cloudcast.sections)
      : sectionsToTracklist(cloudcast.sections)
  }

  /** @type Mix **/
  return {
    id: cloudcast.id,
    path: '/' + usernameAndSlug.username + '/' + usernameAndSlug.slug + '/',
    hasBasicTracklist: isDataInsideChapter,
    tracklist: tracklist
  }
}

/**
 * @param sections
 * @returns {BasicTrackInfo[]}
 */
function sectionsToBasicTracklist (sections) {
  return sections.map((section, index) => {
    return {
      trackNumber: formatTrackNumber(index),
      chapter: section.chapter ? section.chapter : 'unknow'
    }
  })
}

/**
 * @param sections
 * @returns {CompleteTrackInfo[]}
 */
function sectionsToTracklist (sections) {
  // use to know if formatting time for all track at xx:xx:xx or xx:xx (for templates's homogeneity)
  const keepHours = !isNaN(sections[sections.length - 1].startSeconds) && sections[sections.length - 1].startSeconds > 3600
  return sections.map((section, index) => {
    return {
      trackNumber: (index + 1) < 10 ? '0' + (index + 1) : '' + (index + 1),
      timestamp: section.startSeconds,
      time: setTime(section.startSeconds, keepHours),
      artistName: section.artistName === undefined ? 'unknow' : section.artistName,
      songName: section.songName === undefined ? 'unknow' : section.songName
    }
  })
}

function setTime (seconds, keepHours) {
  let time
  if (seconds === null || seconds === undefined) {
    time = 'not provided'
  } else {
    time = timetoHHMMSS(seconds, keepHours)
  }
  return time
}

function timetoHHMMSS (time, keepHours) {
  var second = parseInt(time, 10)
  var hours = Math.floor(second / 3600) % 24
  var minutes = Math.floor(second / 60) % 60
  var seconds = second % 60
  return [hours, minutes, seconds]
    .map(v => v < 10 ? '0' + v : v)
    .filter((v, i) => {
      return keepHours === true ? true : (v !== '00' || i > 0)
    })
    .join(':')
}

function formatTrackNumber (trackIndex) {
  return (trackIndex + 1) < 10 ? '0' + (trackIndex + 1) : '' + (trackIndex + 1)
}

function isDataInChapter (sections) {
  let noArtistName = false
  let noSongName = false
  let atLeastOneChapter = false
  sections.forEach(section => {
    noArtistName = noArtistName || section.artistName === undefined
    noSongName = noSongName || section.songName === undefined
    atLeastOneChapter = atLeastOneChapter || section.chapter !== undefined
  })

  return noArtistName && noSongName && atLeastOneChapter
}

module.exports = { cloudcastToMix }
