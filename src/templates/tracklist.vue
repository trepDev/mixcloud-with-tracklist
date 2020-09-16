<template>
    <!--  TODO SANS DIV -->
    <div>
        <div class="mwt-tracklist-container">
            <div class="mwt-header">
                <div class="header-number">#</div>
                <div class="header-timestamp">Time</div>
                <div class="header-track">Song</div>
                <div class="header-artist">Artist</div>
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
      hasTimestamp: hasTimestamp
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
        width: 40%;
    }
    .header-artist{
        width: 40%;
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
        width: 40%;
    }
    .row-artist{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 40%;
    }

    .pointer {
      cursor: pointer;
    }
    .activeTimestamp {
      cursor: pointer;
      color : #4fa6d3
    }
</style>
