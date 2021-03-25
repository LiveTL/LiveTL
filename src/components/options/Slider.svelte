<script>
  import { Button, Icon, Slider } from "svelte-materialify/src";
  import { mdiRestore } from "@mdi/js";
  import { Browser, BROWSER } from "../../js/web-constants.js";

  export let min = BROWSER == Browser.ANDROID ? 0.25 : 0.5;
  export let max = BROWSER == Browser.ANDROID ? 1.5 : 2;
  export let name = "";
  export let store = null;
  export let color = "blue";

  let diff = max - min;
  $: value = Math.round((($store - min) * 100) / diff + min);
  $: scaledBack = ((value - min) * diff) / 100 + min;
  $: store.set(scaledBack);
</script>

<Slider bind:value {color}>
  <div slot="default">
    {name}:
  </div>
  <div slot="append-outer">
    <div class="reset-button">
      <Button on:click={() => store.reset()} size="x-small">
        <Icon size="20px" path={mdiRestore} />
      </Button>
    </div>
  </div>
</Slider>

<style>
  :global(.s-slider) {
    max-width: 100% !important;
  }

  .reset-button {
    color: #181818;
  }

  .reset-button:hover {
    color: #2196f3;
  }
</style>
