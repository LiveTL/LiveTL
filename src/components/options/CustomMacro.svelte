<script>
  import { Row, Col, Checkbox, TextField } from 'svelte-materialify/src';
  import { macros } from '../../js/store.js';

  export let name;
  export let expansion;
  export let enabled;
  export let id;

  let field;

  const saveValues = newMacro => {
    $macros = $macros.map((m, i) => i == id ? newMacro : m);
  };

  $: saveValues({ name, expansion, enabled });
  $: if (field) {
    field.querySelector('input[type=text]').focus();
  }
</script>

<Row>
  <Col>
    <span bind:this={field}>
      <TextField dense bind:value={name}>Name</TextField>
    </span>
  </Col>
  <Col>
    <TextField dense bind:value={expansion}>Expansion</TextField>
  </Col>
  <Checkbox bind:checked={enabled} />
</Row>
