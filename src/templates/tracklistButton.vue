<template>
  <button id="toogleTracklist"
          v-bind:class="{ 'button__StyledButton-css-in-js__sc-1hu2thj-1 active-button': settings.showTracklist,
          'button__StyledButton-css-in-js__sc-1hu2thj-1 UXbDG': !settings.showTracklist}">
    <span class="button__StyledChildren-css-in-js__sc-1hu2thj-0 inkfGg noUppercase">
          <svg class="" xmlns="http://www.w3.org/2000/svg" width="19px" height="14px" viewBox="0 0 19 14" version="1.1">
      <path class="st0" d="M6,2h12c0.6,0,1-0.4,1-1s-0.4-1-1-1H6C5.4,0,5,0.4,5,1S5.4,2,6,2z M18,12H6c-0.6,0-1,0.4-1,1s0.4,1,1,1h12
        c0.6,0,1-0.4,1-1S18.6,12,18,12z M1.5,0H1C0.4,0,0,0.4,0,1s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,0,1.5,0z M1.5,12H1c-0.6,0-1,0.4-1,1
        s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,12,1.5,12z M18,6H6C5.4,6,5,6.4,5,7l0,0c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1l0,0
        C19,6.4,18.6,6,18,6z M1.5,6H1C0.4,6,0,6.4,0,7s0.4,1,1,1h0.5c0.6,0,1-0.4,1-1S2.1,6,1.5,6z"></path></svg>
      <span>
            {{ settings.showTracklist ? 'Hide Tracklist' : 'Show Tracklist' }}
      </span>
    </span>


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