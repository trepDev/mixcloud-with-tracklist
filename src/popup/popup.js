import Vue from 'vue'
import Tracklist from '../templates/tracklist.vue'
import domUtil from '../utils/domUtil'

const ComponentClassTracklistVue = Vue.extend(Tracklist)
let tracklistVue

function initializeTracklist () {
  const tracklist = JSON.parse(`[{"trackNumber":"01","time":"no time","artistName":"GriZ","songName":"Keep Bouncin'"},{"trackNumber":"02","time":"no time","artistName":"Dre & Snoop","songName":"Next Episode"},{"trackNumber":"03","time":"no time","artistName":"GriZ","songName":"Mystik Dub"},{"trackNumber":"04","time":"no time","artistName":"Morlack","songName":"Hate on Dog Later"},{"trackNumber":"05","time":"no time","artistName":"Come Down (Ross Go Re","songName":"Funk)"},{"trackNumber":"06","time":"no time","artistName":"Outkast","songName":"Spaghetti Junction"},{"trackNumber":"07","time":"no time","artistName":"DJ Bacon","songName":"Shake Yo Rump"},{"trackNumber":"08","time":"no time","artistName":"Jurassic 5","songName":"(Who's Gonna Be The) Next Victim"},{"trackNumber":"09","time":"no time","artistName":"EPMD","songName":"K.I.M."},{"trackNumber":"10","time":"no time","artistName":"The Fugees","songName":"FuGeeLa"},{"trackNumber":"11","time":"no time","artistName":"Late Night Radio","songName":"Break Free"},{"trackNumber":"12","time":"no time","artistName":"A Tribe Called Quest","songName":"Check the Rhime"},{"trackNumber":"13","time":"no time","artistName":"Lazy Syrup Orchestra","songName":"Sweet Trees"},{"trackNumber":"14","time":"no time","artistName":"LJC","songName":"Almost Changed"},{"trackNumber":"15","time":"no time","artistName":"The Allergies","songName":"It Feels so Good"}]`)


  tracklistVue = new ComponentClassTracklistVue()
  tracklistVue.tracklist = tracklist
  tracklistVue.$mount()

  const tracklistHeaderAsNode = document.querySelector('[class^="hidden"]')

  const tracklistParentContainerAsNode = tracklistHeaderAsNode.parentNode
  const tracklistAsNode = tracklistParentContainerAsNode.childNodes[1]
  const tracklistHandler = domUtil.replace(tracklistParentContainerAsNode, tracklistVue.$el, tracklistAsNode)

  tracklistHandler.show()

  return tracklistHandler
}

initializeTracklist()
