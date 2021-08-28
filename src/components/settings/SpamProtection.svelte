<script>
  import { enableSpamProtection } from '../../js/store.js';
  import { spammersDetected, spamMsgAmount, spamMsgInterval } from '../../js/store.js';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  import Card from '../common/Card.svelte';
  import Slider from '../common/SliderStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';

  export let boundingDiv;

  const codeClass = 'px-1 bg-gray-700';

  $: amount = `${Math.round($spamMsgAmount)}`;
  $: interval = `${Math.round($spamMsgInterval)}`;
  $: intervalPlural = Math.round($spamMsgInterval) === 1 ? '' : 's';
</script>

<Card title="Spam protection" icon="report">
  <Checkbox name="Enable spam protection" store={enableSpamProtection} />
  {#if $enableSpamProtection}
    <small class="p-2 rounded bg-gray-800">
      Hide spammers that send <code class={codeClass}>{amount}</code>
      or more messages within <code class={codeClass}>{interval}</code>
      second{intervalPlural}
    </small>
    <Slider
      name="Spam detection threshold"
      store={spamMsgAmount}
      min={2}
      max={101}
      step={1}
    />
    <Slider
      name="Spam detection timeframe"
      store={spamMsgInterval}
      min={1}
      max={100}
      step={1}
    />
    <MultiDropdown
      name="Detected spammers"
      store={spammersDetected}
      getDisplayName={(_id, v) => v.author}
      getBool={id => spammersDetected.get(id).spam}
      setBool={(id, spam) =>
        spammersDetected.set(id, { ...spammersDetected.get(id), spam })}
      {boundingDiv}
    />
  {/if}
</Card>
