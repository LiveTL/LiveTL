<script>
  import { Button, Icon, Slider } from 'svelte-materialify/src';
  import { mdiRestore } from '@mdi/js';
  import { Browser, BROWSER } from '../../js/constants.js';

  export let min = BROWSER == Browser.ANDROID ? 0.25 : 0.5;
  export let max = BROWSER == Browser.ANDROID ? 1.5 : 2;
  export let name = '';
  export let store = null;
  export let color = 'blue';
  export let step = null;
  export let thumb = false;

  let diff = max - min;
  $: value = Math.round((($store - min) * 100) / diff + min);
  $: scaledBack = ((value - min) * diff) / 100 + min;
  $: store.set(scaledBack);

  let wrapper = null;
  $: if (wrapper && thumb) {
    let e = wrapper.querySelector('.s-slider__tooltip');
    if (e) {
      e.setAttribute('data-content', Math.round(scaledBack));
    }
  }
</script>

<div bind:this={wrapper}>
  <Slider bind:value {color} {step} {thumb}>
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
</div>

<style>
  :global(.s-slider) {
    max-width: 100% !important;
  }

  :global(.s-slider__tooltip) {
    font-size: 0px;
    word-break: keep-all;
  }

  :global(.s-slider__tooltip::after) {
    font-size: 0.75rem;
    content: attr(data-content);
  }

  .reset-button {
    color: #2196f3;
  }

  .reset-button:hover {
    color: #2196f3;
  }
</style>
