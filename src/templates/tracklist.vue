<template>
  <div v-if="tracklist.length === 0" style="min-width: 780px; padding: 24px; text-align: center;">
    <p style="font-size: 18px; font-weight: 400;">Sorry but the DJ didn't provide any tracklist for this mix.</p>
  </div>
    <div v-else class="mwt-tracklist-container">
      <div class="mwt-header">
        <div class="header-number">#</div>
        <div class="header-timestamp">Time</div>
        <div class="header-artist">Artist</div>
        <div class="header-track">Song</div>
        <a class="header-copy copy-button" v-on:click="copyToClipoard(tracklist)"><svg height="10pt" viewBox="-40 0 512 512" width="10pt" xmlns="http://www.w3.org/2000/svg"><path d="m271 512h-191c-44.113281 0-80-35.886719-80-80v-271c0-44.113281 35.886719-80 80-80h191c44.113281 0 80 35.886719 80 80v271c0 44.113281-35.886719 80-80 80zm-191-391c-22.054688 0-40 17.945312-40 40v271c0 22.054688 17.945312 40 40 40h191c22.054688 0 40-17.945312 40-40v-271c0-22.054688-17.945312-40-40-40zm351 261v-302c0-44.113281-35.886719-80-80-80h-222c-11.046875 0-20 8.953125-20 20s8.953125 20 20 20h222c22.054688 0 40 17.945312 40 40v302c0 11.046875 8.953125 20 20 20s20-8.953125 20-20zm0 0"/></svg></a>
      </div>
      <div v-for="track in tracklist" class="table-row" >
        <div id='trackNumber' class="row-number"
             v-bind:class="{ 'pointer': hasTimestamp(track.timestamp) }"
             v-bind:title="getTitleAttribute(track.timestamp)"
             v-on:click="callContentToPlayTrack(track.timestamp)">
          {{track.trackNumber}}
        </div>
        <div id='timestamp' class="row-timestamp"
             v-bind:class="{ 'activeTimestamp': hasTimestamp(track.timestamp) && isFromPlayer}"
             v-bind:title="getTitleAttribute(track.timestamp)"
             v-on:click="callContentToPlayTrack(track.timestamp, isFromPlayer)">
          {{track.time}}
        </div>
        <div class="row-artist">{{track.artistName}}</div>
        <div class="row-track">
          {{track.songName}}
        </div>
      </div>
    </div>
</template>

<script>
export default {
  props:[
    'tracklist', 'isFromPlayer', 'callContentToPlayTrack'
  ],
  methods: {
    hasTimestamp: hasTimestamp,
    copyToClipoard: copyToClipoard,
    getTitleAttribute: getTitleAttribute,
  }
}

function hasTimestamp (timestamp) {
  return timestamp !== null && timestamp !== undefined
}

function copyToClipoard(tracklist) {
  let toCopy = '';
  tracklist.forEach((track) => toCopy = toCopy + track.trackNumber + ' - ' + track.time + ' - ' + track.songName + ' - ' + track.artistName + '\n');
  navigator.clipboard.writeText(toCopy);
}

function getTitleAttribute (timestamp) {
  return hasTimestamp(timestamp) ? 'play' : 'no play'
}
</script>

<style lang="css" scoped>
p {
  font-size: 20px;
}

* {
  box-sizing: border-box;
}

.mwt-tracklist-container {
  width: 780px;
  padding: 0px 10px 0px 10px;
}

.mwt-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  line-height: 30px;
  border-top: 2px solid rgb(235, 240, 242);
  border-bottom: 2px solid rgb(235, 240, 242);
  color: rgb(105, 127, 149);
  font-weight: 600;
}

.table-row {
  display: flex;
  flex-direction: row;
  line-height: 30px;
  border-bottom: 1px solid rgb(235, 240, 242);
  color: rgb(105, 127, 149);
  font-weight: 400;
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
  padding-left: 12px;
  padding-bottom: 0px;
  padding-top: 7px;
  color: rgb(30, 35, 55)
}

.row-number {
  width: 5%;
}

.row-timestamp {
  width: 15%;
}

.row-track {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 37.5%;
}

.row-artist {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 37.5%;
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
  -webkit-user-select: none;
  vertical-align: middle;
  background-color: #fff;
}

.activeTimestamp {
  cursor: pointer;
  color: #4fa6d3
}

.copy-button:hover {
  background-color: rgba(79, 166, 211, 0.3);
}

.copy-button:active {
  background-color: rgba(79, 166, 211, 0.8);
}
</style>
