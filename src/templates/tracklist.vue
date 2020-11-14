<template>
    <div>
        <div class="mwt-tracklist-container">
            <div class="mwt-header">
                <div class="header-number">#</div>
                <div class="header-timestamp">Time</div>
                <div class="header-track">Song</div>
                <div class="header-artist">Artist</div>
                <a class="header-copy btn btn-inverse" v-on:click="copyToClipoard(tracklist)"><svg height="10pt" viewBox="-40 0 512 512" width="10pt" xmlns="http://www.w3.org/2000/svg"><path d="m271 512h-191c-44.113281 0-80-35.886719-80-80v-271c0-44.113281 35.886719-80 80-80h191c44.113281 0 80 35.886719 80 80v271c0 44.113281-35.886719 80-80 80zm-191-391c-22.054688 0-40 17.945312-40 40v271c0 22.054688 17.945312 40 40 40h191c22.054688 0 40-17.945312 40-40v-271c0-22.054688-17.945312-40-40-40zm351 261v-302c0-44.113281-35.886719-80-80-80h-222c-11.046875 0-20 8.953125-20 20s8.953125 20 20 20h222c22.054688 0 40 17.945312 40 40v302c0 11.046875 8.953125 20 20 20s20-8.953125 20-20zm0 0"/></svg></a>
            </div>
            <div v-for="track in tracklist" class="table-row" >
                <div id='trackNumber' class="row-number"
                     v-bind:class="{ 'pointer': hasTimestamp(track.timestamp) }"
                     v-bind:title="getTitleAttribute(track.timestamp)"
                     v-on:click="playTrack(track.timestamp)">
                    {{track.trackNumber}}
                </div>
                <div id='timestamp' class="row-timestamp"
                     v-bind:class="{ 'activeTimestamp': hasTimestamp(track.timestamp) }"
                     v-bind:title="getTitleAttribute(track.timestamp)"
                     v-on:click="playTrack(track.timestamp)">
                    {{track.time}}
                </div>
                <div class="row-track"
                     v-bind:class="{ 'pointer': hasTimestamp(track.timestamp) }"
                     v-bind:title="getTitleAttribute(track.timestamp)"
                     v-on:click="playTrack(track.timestamp)">
                    {{track.songName}}
                </div>
                <div class="row-artist">{{track.artistName}}</div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    data () {
      return {tracklist: []}
    },
    methods: {
      playTrack:
        function (timestamp) {
          if(hasTimestamp(timestamp) && timestamp != 0) {
            let replaybutton = document.querySelectorAll('button[class^="PlayerSeekingActions__ReplayButton"]')
            // Have to click on replay else play on track don't work
            replaybutton[0].click()
            // Have to set a timeout else play on track don't work
            setTimeout(() => document.getElementsByTagName('audio')[0].currentTime = timestamp, 200)
          }
        },
      getTitleAttribute: function(timestamp) {
        return hasTimestamp(timestamp) ? 'play' : 'no play'
      },
      hasTimestamp: hasTimestamp,
      copyToClipoard: function (tracklist) {
        let toCopy = '';
        tracklist.forEach((track) => toCopy = toCopy + track.trackNumber + ' - ' + track.songName + ' - ' + track.artistName + '\n');
        navigator.clipboard.writeText(toCopy);
      }
    }
  }

  function hasTimestamp (timestamp){
    return timestamp !== null && timestamp !== undefined && timestamp !== 0
  }
</script>

<style lang="css" scoped>
    p {
        font-size: 20px;
    }

    * {
        box-sizing: border-box;
    }

    .mwt-header{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        line-height: 30px;
        border-top: 2px solid rgb(235, 240, 242);
        border-bottom: 2px solid rgb(235, 240, 242);
        color:rgb(105, 127, 149);
        font-weight: 600;
    }
    .table-row{
        display: flex;
        flex-direction: row;
        line-height: 30px;
        border-bottom: 1px solid rgb(235, 240, 242);
        color:rgb(105, 127, 149);
        font-weight: 400;
    }

    .header-number{
        width: 5%;
    }
    .header-timestamp{
        width: 15%;
    }
    .header-track{
        width: 37.5%;
    }
    .header-artist{
        width: 37.5%;
    }

    .header-copy{
      width: 5%;
      padding-left: 12px;
      padding-bottom: 0px;
      padding-top: 7px;
      color: #4fa6d3
    }

    .row-number{
        width: 5%;
    }
    .row-timestamp{
        width: 15%;
    }
    .row-track{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 37.5%;
    }
    .row-artist{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 37.5%;
    }

    .pointer {
      cursor: pointer;
    }
    .activeTimestamp {
      cursor: pointer;
      color : #4fa6d3
    }
</style>
