<script>
  import { Button, Icon, Row, Col, Checkbox, TextField } from 'svelte-materialify/src';
  import { mdiDelete } from '@mdi/js';
  import { macros } from '../../js/store.js';

  export let name;
  export let expansion;
  export let enabled;
  export let id;

  let field;

  const saveValues = newMacro => {
    $macros = $macros.map((m, i) => i == id ? newMacro : m);
  };

  const deleteMacro = () => {
    $macros = $macros.filter((_, i) => i != id);
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
  <div style="display: flex;">
    <Checkbox bind:checked={enabled} />
    <div style="height: 100%; display: flex; align-items: center; padding-right: 5px;">
      <Button icon class="red-text" on:click={deleteMacro}>
        <Icon path={mdiDelete} />
      </Button>
    </div>
  </div>
</Row>
