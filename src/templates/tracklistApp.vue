<script>
export default {
  props: ['mixesData', 'callContentToPlayTrack'],
  data() {
    return {currentMix : null}
  },
  created() {
    if (this.mixesData) {
      this.currentMix = this.mixesData[0]
    }
  },
  methods: {
    onTabClick: onTabClick,
  }
}

function onTabClick(selectedMix) {
  if (selectedMix !== this.currentMix) {
    this.currentMix = selectedMix
  }
}
</script>

<template>
  <NoMix v-if="!mixesData || mixesData.length === 0"/>
  <template v-else>
    <nav class="scrollable-header">
      <a v-for="mixData in mixesData"
         v-bind:id="mixData.id"
         class="mix-title-header"
         v-on:click="onTabClick(mixData)"
      >{{ mixData.title }}</a>
    </nav>
    <Tracklist :tracklist="currentMix.tracklist"
               :isFromPlayer="currentMix.isFromPlayer"
               :callContentToPlayTrack="callContentToPlayTrack"/>
  </template>
</template>

<style scoped>
.scrollable-header {
  background-color: #333;
  overflow: auto;
  white-space: nowrap;
}

.mix-title-header {
  display: inline-block;
  color: white;
  text-align: center;
  padding: 14px;
  text-decoration: none;
}
</style>