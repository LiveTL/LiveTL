<script lang="ts">
  import { writable } from 'svelte/store';
  // import { onMount } from 'svelte';
  import { modifyFilter, deleteFilter } from '../../js/filter.js';
  import Dropdown from '../common/DropdownStore.svelte';
  import { showBlockItems, plainRegexItems, chatAuthorItems } from '../../js/constants.js';
  import TextField from '../common/TextField.svelte';
  import { isValidRegex } from '../../ts/utils';

  export let rule = '';
  export let showBlock = 'show';
  export let plainReg = 'plain';
  export let chatAuthor = 'chat';
  export let id = '';
  export let boundingDiv: HTMLElement;

  let div: HTMLElement | undefined;
  const sShowBlock = writable(showBlock);
  const sPlainReg = writable(plainReg);
  const sChatAuthor = writable(chatAuthor);
  const textRules = [{
    error: 'Invalid regex',
    assert: (value: string) =>
      ($sPlainReg === 'regex') ? isValidRegex(value) : true
  }];

  const updateFilter = (showBlock: string, plainRegex: string, chatAuthor: string, rule: string) => {
    modifyFilter(id, chatAuthor, plainRegex, showBlock, rule);
  };

  $: updateFilter($sShowBlock, $sPlainReg, $sChatAuthor, rule);

  // onMount(() => {
  //   div.scrollIntoView({
  //     behavior: 'smooth',
  //     block: 'nearest',
  //     inline: 'nearest'
  //   });
  // });
</script>

<div class="flex flex-col rounded gap-2" bind:this={div}>
  <div class="flex flex-row gap-2 flex-wrap">
    <Dropdown dense store={sShowBlock} items={showBlockItems} class="w-32 flex-shrink-0 flex-auto" {boundingDiv} />
    <Dropdown dense store={sPlainReg} items={plainRegexItems} class="w-32 flex-shrink-0 flex-auto" {boundingDiv} />
    <Dropdown dense store={sChatAuthor} items={chatAuthorItems} class="w-32 flex-shrink-0 flex-auto" {boundingDiv} />
  </div>
  <div class="flex flex-row">
    <div class="flex-1">
      <TextField dense bind:value={rule} clearable rules={textRules} clearableFn={() => deleteFilter(id)} />
    </div>
  </div>
</div>
