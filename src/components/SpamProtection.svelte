<script>
  import { Subheader } from 'svelte-materialify/src';
  import { enableSpamProtection, spamMsgAmount, spamMsgInterval } from '../js/store.js';
  import Slider from './options/Slider.svelte';
  import Toggle from './options/Toggle.svelte';

  const nbsp = ' ';

  $: amount = `${Math.ceil($spamMsgAmount)}`.padStart(2, nbsp);
  $: interval = `${Math.ceil($spamMsgInterval)}`.padStart(2, nbsp);
  $: intervalPlural = Math.ceil($spamMsgInterval) == 1 ? nbsp : 's';
</script>

<Toggle name="Spam protection" store={enableSpamProtection} />
{#if $enableSpamProtection}
  <Slider
    name="Spam authors post at least {amount} messages"
    store={spamMsgAmount}
    min={2}
    max={98}
    suffix=""
  />
  <Slider
    name="every {interval} second{intervalPlural}"
    store={spamMsgInterval}
    min={1}
    max={98}
    suffix=""
  />
{/if}
