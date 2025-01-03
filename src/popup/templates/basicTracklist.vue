<script>

export default {
  props: ['tracklist'],
}
</script>

<template>
  <div v-if="tracklist.length === 0" style="min-width: 780px; padding: 24px; text-align: center;">
    <p>Sorry but the DJ didn't provide any tracklist for this mix.</p>
  </div>
  <div v-else>
    <p style="padding-left: 24px">The mix author provided the information incorrectly, so here is the raw input as submitted.</p>
    <ol type="1">
      <li v-for="track in tracklist" >
        {{track.chapter}}
      </li>
    </ol>
  </div>

</template>

<style scoped>

</style>