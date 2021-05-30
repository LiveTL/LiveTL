<script>
  import { Row, Col, Checkbox, TextField } from 'svelte-materialify/src';
  import { macros } from '../../js/store.js';

  export let name;
  export let expansion;
  export let enabled;
  export let id;
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
