<script>
  import { Row, Col, Checkbox, TextField } from 'svelte-materialify/src';
  import { macros } from '../../js/store.js';

  export let name;
  export let expansion;
  export let enabled;
  export let id;

  const saveValues = newMacro => {
    $macros = $macros.map((m, i) => i == id ? newMacro : m);
  };

  $: saveValues({ name, expansion, enabled });
</script>

<Row>
  <Col>
    <TextField dense bind:value={name} />
  </Col>
  <Col>
    <TextField dense bind:value={expansion} />
  </Col>
  <Checkbox bind:checked={enabled} />
</Row>
