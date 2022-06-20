<script>
  import {
    enableSpamProtection,
    spamMsgAmount,
    spamMsgInterval,
    ytcDeleteBehaviour,
    disableSpecialSpamProtection
  } from '../../js/store.js';
  import { ytcDeleteItems } from '../../js/constants.js';
  import Card from '../common/Card.svelte';
  import Slider from '../common/SliderStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Dropdown from '../common/DropdownStore.svelte';

  export let boundingDiv;

  const codeClass = 'px-1 bg-gray-700';

  $: amount = `${Math.round($spamMsgAmount)}`;
  $: interval = `${Math.round($spamMsgInterval)}`;
  $: intervalPlural = Math.round($spamMsgInterval) === 1 ? '' : 's';
</script>

<Card title="Spam protection" icon="report">
  <Dropdown
    name="When messages are deleted by moderators"
    store={ytcDeleteBehaviour}
    items={ytcDeleteItems}
    boundingDiv={boundingDiv}
  />
  <Checkbox name="Enable extra spam protection" store={enableSpamProtection} />
  {#if $enableSpamProtection}
    <Checkbox
      name="Bypass spam detection filter for trusted users"
      store={disableSpecialSpamProtection}
    />
    <small class="p-2 rounded bg-gray-800">
      Block spammers that send <code class={codeClass}>{amount}</code>
      or more messages within <code class={codeClass}>{interval}</code>
      second{intervalPlural}
    </small>
    <Slider
      name="Spam detection threshold"
      store={spamMsgAmount}
      min={2}
      max={101}
      step={1}
      showValue={false}
    />
    <Slider
      name="Spam detection timeframe"
      store={spamMsgInterval}
      min={1}
      max={100}
      step={1}
      showValue={false}
    />
    <small class="p-2 rounded bg-gray-800">
      User blacklists and whitelists can be adjusted in the
      <a href="/" class="text-blue-400 underline" on:click={(e) => {
        e.preventDefault();
        document.querySelector('.block-and-whitelist').scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }}>Blocked/Whitelisted Users</a>
      section.
    </small>
  {/if}
</Card>
