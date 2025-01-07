<script>
export default {
  props: {
    /** @type MixViewModel[] */
    mixesData: Array,
    /** @type CallContentToPlayTrack */
    callContentToPlayTrack: Function,
  },
  data() {
    return { /** @type {MixViewModel|null} */ currentMix : null}
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

/**
 * @param {MixViewModel} selectedMix
 */
function onTabClick(selectedMix) {
  if (selectedMix !== this.currentMix) {
    this.currentMix = selectedMix
    document.getElementById('announce').textContent = "The tracklist has been updated"
    setTimeout(() => {document.getElementById('announce').textContent = ""}, 500)
  }
}

/**
 * @param {number} itemsCount - The number of items.
 * @param {string} mixId - The ID of the mix.
 * @returns The CSS classes to apply to the header.
 */
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
         href="#"
         v-bind:aria-label=" mixData.title + ' tracklist'"
      >{{ mixData.title }}</a>
    </nav>
    <section>
      <div id="announce" class="visually-hidden" aria-live="polite"></div>
      <div v-if="currentMix.tracklist.length === 0" style="padding: 24px; text-align: center;">
        <p>Sorry but the DJ didn't provide any tracklist for this mix.</p>
      </div>
      <template v-else>
        <BasicTracklist v-if="currentMix.hasBasicTracklist"
                        :tracklist="currentMix.tracklist"></BasicTracklist>
        <Tracklist v-else
                   :tracklist="currentMix.tracklist"
                   :isFromPlayer="currentMix.isFromPlayer"
                   :callContentToPlayTrack="callContentToPlayTrack"/>
      </template>
    </section>
    <template v-if="!currentMix.hasBasicTracklist && currentMix.tracklist.length > 17">
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
  color: #69788C;
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

.visually-hidden {
  overflow:hidden;
  height:0;
  width:0;
}
</style>