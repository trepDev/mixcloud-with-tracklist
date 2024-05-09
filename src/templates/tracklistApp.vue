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
    getHeaderItemClass: getHeaderItemClass
  }
}

function onTabClick(selectedMix) {
  if (selectedMix !== this.currentMix) {
    this.currentMix = selectedMix
  }
}

function getHeaderItemClass (itemsCount, mixId) {
  const isCurrentMix = this.currentMix.id === mixId
  if (itemsCount === 1) {
    return { 'mix-title-header': true, 'selected-title-header': false}
  } else if (itemsCount <= 4 ){
    return { 'mix-title-header-2': true, 'selected-title-header': isCurrentMix}
  } else {
    return { 'mix-title-header-multi': true, 'selected-title-header': isCurrentMix }
  }
}
</script>

<template>
  <NoMix v-if="!mixesData || mixesData.length === 0"/>
  <template v-else>
    <nav class="scrollable-header">
      <a v-for="mixData in mixesData"
         v-bind:id="mixData.id"
         v-bind:class="getHeaderItemClass(mixesData.length, mixData.id)"
         v-bind:title="mixData.title"
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
  background-color: #171C2B;
  display: flex;
  width: 780px;
  overflow-x: auto;

  a:last-child {
    border-width: 0;
  }
}

.unselected-title-header {
  background-color: white;
}

.mix-title-header {
  flex: 1;
  color: white;
  text-align: center;
  padding: 14px;
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.mix-title-header-2 {
  flex: 1;
  color: white;
  text-align: center;
  padding: 14px;
  border-right-width: 2px;
  border-right: solid;
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.mix-title-header-multi {
  flex: 0 0 169px;
  color: white;
  text-align: center;
  padding: 14px;
  border-right-width: 2px;
  border-right: solid;
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.selected-title-header {
  background-color: white;
  color: black;
}
</style>