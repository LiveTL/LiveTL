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
  }

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
  <!--
    @Kento, @ChrRubin, can you see whether width should also be set to 3.5em?
    Idk which looks better
  -->
  <Button icon class="red-text" style="height: 3.5em;" on:click={deleteMacro}>
    <Icon path={mdiDelete} />
  </Button>
</Row>
