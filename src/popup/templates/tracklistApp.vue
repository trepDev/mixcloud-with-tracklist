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
    return { 'common-mix-title-header': true, 'mix-title-header': true, 'selected-title-header': false}
  } else if (itemsCount <= 4 ){
    return { 'common-mix-title-header': true, 'mix-title-header-2': true, 'selected-title-header': isCurrentMix}
  } else {
    return { 'common-mix-title-header': true, 'mix-title-header-multi': true, 'selected-title-header': isCurrentMix }
  }
}
</script>

<template>
  <NoMix v-if="!mixesData || mixesData.length === 0"/>
  <template v-if="mixesData && mixesData.length > 0">
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
    <template v-if="currentMix.tracklist.length > 17">
      <p class="coffee-text">If you're glad to discover all these tracklists, feel free to</p>
      <a href="https://www.buymeacoffee.com/trepDev" target="_blank">
      <img src="/popup/coffee.png" alt="Buy Me A Coffee" class="coffee-img">
      </a>
    </template>
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

.common-mix-title-header {
  color: white;
  font-size: 17px;
  text-align: center;
  padding: 14px;
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.mix-title-header {
  flex: 1;
}

.mix-title-header-2 {
  flex: 1;
  border-right: 2px solid white;
}

.mix-title-header-multi {
  flex: 0 0 169px;
  border-right: 2px solid white;
}


.selected-title-header {
  background-color: white;
  color: black;
}

.coffee-text {
  color: rgb(105, 127, 149);
  font-weight: 600;
  text-align: center;
}

.coffee-img {
  height: 60px;
  width: 217px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 16px;
}
</style>