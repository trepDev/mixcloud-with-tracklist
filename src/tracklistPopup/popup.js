import Vue from 'vue'
import Tracklist from '../templates/tracklist'
/* eslint-disable no-new */

const ComponentClass = Vue.extend(Tracklist)

const pouet = '{"tracklist":[{"trackNumber":"01","timestamp":0,"time":"00:00","artistName":"SWF Orchestra Rolf Hans Mueller","songName":"Gate One"},{"trackNumber":"02","timestamp":228,"time":"03:48","artistName":"Incredible Bongo Band","songName":"Apache"},{"trackNumber":"03","timestamp":515,"time":"08:35","artistName":"Mickey And The Soul Generation","songName":"Football"},{"trackNumber":"04","timestamp":699,"time":"11:39","artistName":"Alan Hawkshaw","songName":"Sharp Shooter"},{"trackNumber":"05","timestamp":883,"time":"14:43","artistName":"Summer Style","songName":"Cat & Mouse"},{"trackNumber":"06","timestamp":1074,"time":"17:54","artistName":"Johnny Hawksworth","songName":"Roobarb and Custard"},{"trackNumber":"07","timestamp":1111,"time":"18:31","artistName":"Stelvio Cipriani","songName":"La Polizia Chiede Aiuto"},{"trackNumber":"08","timestamp":1365,"time":"22:45","artistName":"Adriano Fabi & Sammy Bardot","songName":"Mark (Mark il poliziotto spara per primo)"},{"trackNumber":"09","timestamp":1574,"time":"26:14","artistName":"Alan Parker","songName":"Trailblazer"},{"trackNumber":"10","timestamp":1703,"time":"28:23","artistName":"Big Al & The Star Treks","songName":"Funky Funk"},{"trackNumber":"11","timestamp":1832,"time":"30:32","artistName":"Augusto Algueró","songName":"Discotheque"},{"trackNumber":"12","timestamp":1957,"time":"32:37","artistName":"Brian Bennett","songName":"Unknowing Surveillance"},{"trackNumber":"13","timestamp":2049,"time":"34:09","artistName":"MFSB","songName":"The Sound Of Philidelphia"},{"trackNumber":"14","timestamp":2299,"time":"38:19","artistName":"Pierre-Alain Dahan & Mat Camison","songName":"Summer Discotheque"},{"trackNumber":"15","timestamp":2483,"time":"41:23","artistName":"Jimmy Castor Bunch","songName":"It\'s Just Begun"},{"trackNumber":"16","timestamp":2682,"time":"44:42","artistName":"Big Jim Sullivan","songName":"Tallyman"},{"trackNumber":"17","timestamp":2840,"time":"47:20","artistName":"Mark Wirtz","songName":"If Illusion Met Fantasy"},{"trackNumber":"18","timestamp":2976,"time":"49:36","artistName":"The Maskmans & The Agents","songName":"Stand Up Pt. 1"},{"trackNumber":"19","timestamp":3105,"time":"51:45","artistName":"Lee Sykes & The Highlanders","songName":"Lock Jaw"},{"trackNumber":"20","timestamp":3226,"time":"53:46","artistName":"Earth,Wind & Fire","songName":"Sweet Sweetbacks Theme"}],"settings":{"trackNumber":true}}'

function activateTracklist () {
  chrome.runtime.sendMessage(
    { path: '' },
    (datas) => {
      const tracklistVue = new ComponentClass({
        data: datas
      })
      tracklistVue.$mount()
    }
  )
}

activateTracklist()
