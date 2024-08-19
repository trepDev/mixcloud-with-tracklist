<template>
  <td v-if="trackClickable"
      v-bind:id="id"
      v-bind:class="'activeTimestamp'"
      v-bind:title="'play'"
      v-on:click="callContentToPlayTrack(track.timestamp, isFromPlayer)"
      v-bind:aria-label="'track number ' + track.trackNumber">
     {{ text }}
  </td>
  <td v-else
      v-bind:id="id"
      v-bind:aria-label="'track number ' + track.trackNumber">
    {{ text }}
  </td>
</template>

<script>
export default {
  name: 'clickable-track',
  props: {
    id: "",
    callContentToPlayTrack: {},
    isFromPlayer: {},
    track: {},
    text: ""
  },
  methods: {
    hasTimestamp: hasTimestamp
  },
  computed: {
    trackClickable: (vm) =>  hasTimestamp(vm.track.timestamp) && vm.isFromPlayer
  }
}

function hasTimestamp (timestamp) {
  return timestamp !== null && timestamp !== undefined
}
</script>
<style lang="css" scoped>

.activeTimestamp {
  cursor: pointer;
  color: #4fa6d3;
}

</style>