<script>
  import { Col, Row, TextField } from 'svelte-materialify/src';
  import { writable } from 'svelte/store';
  import Dropdown from './Dropdown.svelte';

  export let stores = null;
  export let rule = '';
  export let showBlock = 'Show';
  export let plainReg = 'plain';
  export let chatAuthor = 'chat';

  let sShowBlock = writable(showBlock);
  let sPlainReg = writable(plainReg);
  let sChatAuthor = writable(chatAuthor);
  const getItems = values => values.map(v => ({ name: v, value: v }));
  let showBlockItems = getItems(['Show', 'Block']);
  let plainRegItems = getItems(['plain', 'regex']);
  let chatAuthorItems = getItems(['chat', 'author']);
  const style = 'padding-right: 0px; margin-top: auto; margin-bottom: auto;';
</script>

<Row>
  <Col {style}>
    <Dropdown store={sShowBlock} items={showBlockItems} />
  </Col>
  <Col {style}>
    <Dropdown store={sPlainReg} items={plainRegItems} />
  </Col>
  <Col {style}>
    <Dropdown store={sChatAuthor} items={chatAuthorItems} /></Col>
  <Col style={style + 'flex-grow: 2'}>
    <TextField dense clearable bind:value={rule} />
  </Col>
</Row>
