<script>
  import { Col, Row, TextField } from 'svelte-materialify/src';
  import { writable, derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import Dropdown from './Dropdown.svelte';
  import { customFilters } from '../../js/store.js';
  import { addFilter, modifyFilter, deleteFilter } from '../../js/filter.js';

  export let rule = '';
  export let showBlock = 'Show';
  export let plainReg = 'plain';
  export let chatAuthor = 'chat';
  export let id = '';
  export let isNew = false;

  let div;
  let maxRuleLength = 0;
  let sShowBlock = writable(showBlock);
  let sPlainReg = writable(plainReg);
  let sChatAuthor = writable(chatAuthor);
  const getItems = values => values.map(v => ({ name: v, value: v }));
  let showBlockItems = getItems(['Show', 'Block']);
  let plainRegItems = getItems(['plain', 'regex']);
  let chatAuthorItems = getItems(['chat', 'author']);
  const style = 'padding-right: 0px; margin-top: auto; margin-bottom: auto;';
  $: maxRuleLength = Math.max(maxRuleLength, rule.length);
  $: $sShowBlock, $sPlainReg, $sChatAuthor, rule, (() => {
    modifyFilter(id, $sChatAuthor, $sPlainReg, $sShowBlock, rule);
    if (!rule && maxRuleLength) deleteFilter(id);
  })();
  onMount(() => {
    div.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  });
</script>

<div bind:this={div}>
  <Row>
    <Col class="center-top" {style}>
      <Dropdown store={sShowBlock} items={showBlockItems} />
    </Col>
    <Col class="center-top" {style}>
      <Dropdown store={sPlainReg} items={plainRegItems} />
    </Col>
    <Col class="center-top" {style}>
      <Dropdown store={sChatAuthor} items={chatAuthorItems} />
    </Col>
    <Col style={style + 'flex-grow: 2'}>
      <TextField dense clearable bind:value={rule} />
    </Col>
  </Row>
</div>

<style>
  :global(.center-top *) {
    padding-top: auto;
    padding-bottom: auto;
    margin-top: 0px;
  }

  :global(.center-top) {
    padding-top: 0px;
    padding-bottom: 0px;
  }
</style>
