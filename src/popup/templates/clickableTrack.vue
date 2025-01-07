<template>
  <td v-if="trackClickable"
      v-bind:class="'activeTimestamp'"
      v-bind:title="'play'"
      v-on:click="callContentToPlayTrack(track.timestamp, isFromPlayer)"
      v-bind:aria-label="getAriaLabel(infoType, track)">
     {{ text }}
  </td>
  <td v-else
      v-bind:aria-label="getAriaLabel(infoType, track)">
    {{ text }}
  </td>
</template>

<script>
/** @typedef {'trackNumber' | 'timestamp'} InfoType */

export default {
  name: 'clickable-track',
  props: {
    /** @type InfoType */
    infoType: String,
    callContentToPlayTrack: Function,
    isFromPlayer: Boolean,
    /**@type TrackInfo */
    track: Object,
    text: String
  },
  methods: {
    getAriaLabel : getAriaLabel
  },
  computed: {
    trackClickable: (vm) =>  hasTimestamp(vm.track.timestamp) && vm.isFromPlayer
  }
}

/**
 *
 * @param {InfoType} type
 * @param {TrackInfo} trackInfo
 * @returns {string}
 */
function getAriaLabel(type, trackInfo) {
  if(type === 'trackNumber') {
    return 'track number ' + trackInfo.trackNumber
  } else if(type === 'timestamp') {
    return 'track time ' + trackInfo.time
  }
}

function hasTimestamp (timestamp) {
  return timestamp !== null && timestamp !== undefined
}
</script>
<style lang="css" scoped>

.activeTimestamp {
  cursor: pointer;
  color: #5000FF;
}

</style>