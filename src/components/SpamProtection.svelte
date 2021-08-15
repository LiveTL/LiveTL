<script>
  import { Subheader } from 'svelte-materialify/src';
  import { enableSpamProtection } from '../js/store.js';
  import { spammersDetected, spamMsgAmount, spamMsgInterval } from '../js/store.js';
  import Slider from './options/Slider.svelte';
  import Toggle from './options/Toggle.svelte';
  import MultiDropdown from './options/MultiDropdown.svelte';

  $: amount = `${Math.round($spamMsgAmount)}`;
  $: interval = `${Math.round($spamMsgInterval)}`;
  $: intervalPlural = Math.round($spamMsgInterval) == 1 ? '' : 's';
</script>

<Toggle name="Spam protection" store={enableSpamProtection} />
{#if $enableSpamProtection}
  <Subheader style="height: 2rem;">
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

  <MultiDropdown
    name="Detected spammers"
    store={spammersDetected}
    getDisplayName={(_id, v) => v.author}
    getBool={id => spammersDetected.get(id).spam}
    setBool={(id, spam) =>
      spammersDetected.set(id, { ...spammersDetected.get(id), spam })}
  />
{/if}

<style>
  .spam-sliders {
    padding: 0px 10px 0px 10px;
  }
  .spam-sliders :global(.s-input__slot) {
    margin-bottom: 0px !important;
  }
</style>
