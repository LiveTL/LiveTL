<script>
  import { Subheader } from 'svelte-materialify/src';
  import { enableSpamProtection, spamMsgAmount, spamMsgInterval } from '../js/store.js';
  import Slider from './options/Slider.svelte';
  import Toggle from './options/Toggle.svelte';

  $: amount = `${Math.ceil($spamMsgAmount)}`.padStart(2, ' ');
  $: interval = `${Math.ceil($spamMsgInterval)}`.padStart(2, ' ');
</script>

<Toggle name="Spam protection" store={enableSpamProtection} />
{#if $enableSpamProtection}
  <Slider
    name="Spam authors post at least {amount} messages"
    store={spamMsgAmount}
    min={2}
    max={100}
  />
  <Slider
    name="every {interval} seconds"
    store={spamMsgInterval}
    min={1}
    max={100}
  />
{/if}
