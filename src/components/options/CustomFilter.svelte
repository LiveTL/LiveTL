<script lang="ts">
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { modifyFilter, deleteFilter } from '../../js/filter.js';
  import Dropdown from '../common/DropdownStore.svelte';
  import { showBlockItems, plainRegexItems, chatAuthorItems } from '../../js/constants.js';
  import TextField from '../common/TextField.svelte';

  export let rule = '';
  export let showBlock = 'show';
  export let plainReg = 'plain';
  export let chatAuthor = 'chat';
  export let id = '';

  let div: HTMLElement;
  let maxRuleLength = 0;
  const sShowBlock = writable(showBlock);
  const sPlainReg = writable(plainReg);
  const sChatAuthor = writable(chatAuthor);

  const updateFilter = (showBlock: string, plainRegex: string, chatAuthor: string, rule: string) => {
    modifyFilter(id, chatAuthor, plainRegex, showBlock, rule);
    if (!rule && maxRuleLength) deleteFilter(id);
  };

  $: maxRuleLength = Math.max(maxRuleLength, rule.length);
  $: updateFilter($sShowBlock, $sPlainReg, $sChatAuthor, rule);

  onMount(() => {
    div.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  });
</script>

<div class="flex flex-col flex-wrap rounded bg-gray-800 p-2 gap-2" bind:this={div}>
  <div class="flex flex-row gap-2">
    <Dropdown dense store={sShowBlock} items={showBlockItems} />
    <Dropdown dense store={sPlainReg} items={plainRegexItems} />
    <Dropdown dense store={sChatAuthor} items={chatAuthorItems} />
  </div>
  <div class="flex flex-row">
    <div class="flex-1">
      <TextField dense bind:value={rule}/>
    </div>
  </div>
</div>
