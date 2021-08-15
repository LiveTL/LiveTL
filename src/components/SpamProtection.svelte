<script>
  import { Subheader } from 'svelte-materialify/src';
  import { enableSpamProtection } from '../js/store.js';
  import { spammersDetected, spamMsgAmount, spamMsgInterval } from '../js/store.js';
  import Slider from './options/Slider.svelte';
  import Toggle from './options/Toggle.svelte';
  import MultiDropdown from './options/MultiDropdown.svelte';

  $: amount = `${Math.ceil($spamMsgAmount)}`;
  $: interval = `${Math.ceil($spamMsgInterval)}`;
  $: intervalPlural = Math.ceil($spamMsgInterval) == 1 ? '' : 's';
  $: console.log('SPAM', $spammersDetected);
</script>

<Toggle name="Spam protection" store={enableSpamProtection} />
{#if $enableSpamProtection}
  <Subheader style="height: 2rem; margin-top: 1.5rem;">
    Hide spammers that send {amount} or more messages within {interval} second{intervalPlural}
  </Subheader>
  <div class="spam-sliders">
    <Slider
      name="Spam detection threshold:"
      store={spamMsgAmount}
      min={2}
      max={101}
      suffix=""
    />
    <Slider
      name="Spam detection timeframe:"
      store={spamMsgInterval}
      min={1}
      max={100}
      suffix=""
    />
  </div>

  <MultiDropdown name="Detected spammers" store={spammersDetected} />
{/if}

<style>
  .spam-sliders {
    padding: 0px 10px 0px 10px;
  }
  .spam-sliders :global(.s-input__slot) {
    margin-bottom: 0px !important;
  }
</style>
