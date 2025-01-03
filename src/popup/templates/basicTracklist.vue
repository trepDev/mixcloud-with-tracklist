<script>

export default {
  props: ['tracklist'],
}
</script>

<template>
  <p style="padding-left: 24px">The mix author provided the information incorrectly, so here is the raw input as
    submitted.</p>
  <ol type="1">
    <li v-for="track in tracklist">
      {{ track.chapter }}
    </li>
  </ol>
</template>

<style scoped>

</style>