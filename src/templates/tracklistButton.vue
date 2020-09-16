<template>
  <button id="toogleTracklist" data-tooltip="showHideLabel" class="btn btn-small btn-inverse"
          v-bind:class="{ 'btn-toggled': settings.showTracklist }">
    {{ settings.showTracklist ? 'Hide Tracklist' : 'Show Tracklist' }}
  </button>
</template>

<script>
export default {
  name: 'tracklistButton',
  data () {
    return {
      settings: { showTracklist: true },
    }
  }
}
</script>

<style scoped>

</style>