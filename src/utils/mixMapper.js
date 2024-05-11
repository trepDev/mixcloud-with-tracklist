function cloudcastToMixData(cloudcast, usernameAndSlug) {
  const tracklistData = {
    id: cloudcast.id,
    path: '/' + usernameAndSlug.username + '/' + usernameAndSlug.slug + '/',
    tracklist: sectionsToTracklist(cloudcast.sections)
  }

  return tracklistData
}

function sectionsToTracklist (sections) {
  let tracklist = []
  if (sections && sections.length > 0) {
    // use to know if formatting time for all track at xx:xx:xx or xx:xx (for templates's homogeneity)
    const keepHours = !isNaN(sections[sections.length - 1].startSeconds) && sections[sections.length - 1].startSeconds > 3600
    tracklist = sections.map((section, index) => {
      const track = {
        trackNumber: (index + 1) < 10 ? '0' + (index + 1) : '' + (index + 1),
        timestamp: section.startSeconds,
        time: setTime(section.startSeconds, keepHours),
        artistName: section.artistName === undefined ? 'unknow' : section.artistName,
        songName: section.artistName === undefined ? 'unknow' : section.songName
      }
      return track
    })
  }

  return tracklist
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

module.exports = { cloudcastToMixData }
