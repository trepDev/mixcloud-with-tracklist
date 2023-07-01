<template>
  <button id="tracklistUnavailable" data-tooltip="Tracklist Unavailable" class="button__StyledButton-css-in-js__sc-1hu2thj-1 active-button">
    <span class="button__StyledChildren-css-in-js__sc-1hu2thj-0 inkfGg noUppercase">
    Tracklist unavailable
    </span>

  </button>
</template>

<script>
  export default {
    name: 'tracklistButton',
    data() {
      return {
      };
    }
  }
</script>

<style scoped>
.noUppercase {
  text-transform: none;
}

.active-button {
  display: flex;
  cursor: pointer;
  letter-spacing: 0.88px;
  line-height: 1;
  font-weight: 500;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: transform 300ms ease-out 0s, background-color 300ms ease-out 0s;
  place-items: center;
  -moz-box-align: center;
  -moz-box-pack: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid rgb(255, 255, 255);
  padding: 10px;
  text-transform: uppercase;
  font-size: 14px;
  overflow: unset;
  color: rgb(30, 35, 55);
  background-color: rgb(255, 255, 255);
  width: auto;
}
</style>