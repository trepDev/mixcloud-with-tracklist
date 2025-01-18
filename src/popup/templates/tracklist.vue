<template>
  <div class="mwt-tracklist-container">
    <div class="visually-hidden">Click on a track number or timestamp to play the track. Mix must be already launched from the player to be able to select a track</div>
    <table class="tracklist-table">
      <thead>
      <tr class="mwt-header">
        <th scope="col" class="header-number" aria-label="track number">#</th>
        <th scope="col" class="header-timestamp">Time</th>
        <th scope="col" class="header-artist">Artist</th>
        <th scope="col" class="header-track">Song</th>
        <th class="header-copy" aria-hidden="true">
          <button class="copy-button" v-on:click="copyToClipoard(tracklist)" aria-hidden="true">
            <svg height="10pt" viewBox="-40 0 512 512" width="10pt" xmlns="http://www.w3.org/2000/svg">
              <path d="m271 512h-191c-44.113281 0-80-35.886719-80-80v-271c0-44.113281 35.886719-80 80-80h191c44.113281 0 80 35.886719 80 80v271c0 44.113281-35.886719 80-80 80zm-191-391c-22.054688 0-40 17.945312-40 40v271c0 22.054688 17.945312 40 40 40h191c22.054688 0 40-17.945312 40-40v-271c0-22.054688-17.945312-40-40-40zm351 261v-302c0-44.113281-35.886719-80-80-80h-222c-11.046875 0-20 8.953125-20 20s8.953125 20 20 20h222c22.054688 0 40 17.945312 40 40v302c0 11.046875 8.953125 20 20 20s20-8.953125 20-20zm0 0"/>
            </svg>
          </button>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="track in tracklist" >
        <clickable-track :info-type="'trackNumber'"
                         :call-content-to-play-track="callContentToPlayTrack"
                         :is-from-player="isFromPlayer"
                         :track="track"
                         :text="track.trackNumber"/>
        <clickable-track :info-type="'timestamp'"
                         :call-content-to-play-track="callContentToPlayTrack"
                         :is-from-player="isFromPlayer"
                         :track="track"
                         :text="track.time"/>
        <td >{{ track.artistName }}</td>
        <td colspan="2">{{ track.songName }}</td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- The copy button in the header table is hidden from screen readers, so this one is specifically for them. -->
  <div class="visually-hidden"
       v-on:click="copyToClipoard(tracklist)">
    <button>
      copy tracklist on clipboard
    </button>
  </div>

</template>

<script>
import ClickableTrack from './clickableTrack.vue'

export default {
  components: { ClickableTrack },
  props:{
    /** @type TrackInfo[] */
    tracklist: Array,
    isFromPlayer: Boolean,
    /** @type CallContentToPlayTrack */
    callContentToPlayTrack: Function,
  },
  methods: {
    copyToClipoard: copyToClipoard
  }
}

/**
 *
 * @param {TrackInfo[]} tracklist
 */
function copyToClipoard(tracklist) {
  let toCopy = '';
  tracklist.forEach((track) => toCopy = toCopy + track.trackNumber + ' - ' + track.time + ' - ' + track.songName + ' - ' + track.artistName + '\n');
  navigator.clipboard.writeText(toCopy);
}

</script>

<style lang="css" scoped>
p {
  font-size: 1.125rem;
  font-weight: 400;
  color:#171C2B
}

* {
  box-sizing: border-box;
}

.mwt-tracklist-container {
  padding: 0px 10px 0px 10px;
}

.tracklist-table {
  width: 100%;
  border-collapse: collapse;
}

.mwt-header {
  line-height: 30px;
  border-top: 2px solid rgb(235, 240, 242);
  border-bottom: 2px solid rgb(235, 240, 242);
  color: #69788C;
  font-weight: 600;
}

.header-number {
  width: 5%;
}

.header-timestamp {
  width: 15%;
}

.header-track {
  width: 37.5%;
}

.header-artist {
  width: 37.5%;
}

.header-copy {
  width: 5%;
  padding-bottom: 0px;
  padding-top: 7px;
  color: rgb(30, 35, 55);
}

.copy-button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 0;
  outline: none;
  padding: 9px 16px;
  text-align: center;
  touch-action: manipulation;
  user-select: none;
  vertical-align: middle;
  background-color: #fff;
}

.copy-button:hover {
  background-color: rgba(79, 166, 211, 0.3);
}

.copy-button:active {
  background-color: rgba(79, 166, 211, 0.8);
}

tbody > tr > td {
  color: #171C2B;
  font-weight: 400;
  line-height: 1.875rem;
  border-bottom: 1px solid rgb(235, 240, 242);
}

thead > tr > th {
  text-align: left;
}

.visually-hidden {
  overflow:hidden;
  height:0;
  width:0;
}

</style>
