<script>
  import { Col, Row, TextField } from 'svelte-materialify/src';
  import { writable, derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import Dropdown from './Dropdown.svelte';
  import { customFilters } from '../../js/store.js';
  import { addFilter, modifyFilter, deleteFilter } from '../../js/filter.js';

  export let rule = '';
  export let showBlock = 'show';
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
  let showBlockItems = getItems(['show', 'block']);
  let plainRegItems = getItems(['plain', 'regex']);
  let chatAuthorItems = getItems(['chat', 'author']);
  const style = `
    padding-right: 0px;
  `;
  $: maxRuleLength = Math.max(maxRuleLength, rule.length);
  $: $sShowBlock,
    $sPlainReg,
    $sChatAuthor,
    rule,
    (() => {
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

  let width = 0;
</script>

<div
  bind:this={div}
  class="wrap {width <= 350 ? 'vertical' : ''}"
  bind:clientWidth={width}
>
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
    <Col style={style + 'flex-basis: 100%; margin: 0px 0px 0px 0px;'}>
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
  .wrap {
    margin-bottom: 12px;
    background-color: rgba(255, 255, 255, 0.075);
    padding: 10px;
    border-radius: 5px;
  }
  .wrap :global(.s-row) {
    padding-right: 12px;
  }
  .vertical :global(.s-row:first-of-type) {
    flex-direction: column;
    padding-right: 12px;
  }
</style>
