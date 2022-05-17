<script>
  import {
    enableSpamProtection,
    spammersDetected,
    spamMsgAmount,
    spamMsgInterval,
    ytcDeleteBehaviour,
    disableSpecialSpamProtection
  } from '../../js/store.js';
  import { ytcDeleteItems } from '../../js/constants.js';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  import Card from '../../submodules/chat/src/components/common/Card.svelte';
  import Slider from '../../submodules/chat/src/components/common/SliderStore.svelte';
  import Checkbox from '../../submodules/chat/src/components/common/CheckboxStore.svelte';
  import Dropdown from '../../submodules/chat/src/components/common/DropdownStore.svelte';

  export let boundingDiv;

  let width = 0;
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
    <div bind:clientWidth={width}>
      <MultiDropdown
        name="Detected spammers"
        store={spammersDetected}
        getDisplayName={(_id, v) => v.author}
        getBool={id => spammersDetected.get(id).spam}
        setBool={(id, spam) =>
          spammersDetected.set(id, { ...spammersDetected.get(id), spam })}
        {boundingDiv}
        {width}
      />
    </div>
  {/if}
</Card>
