<script>
  import { Col, Row, Subheader, TextField } from 'svelte-materialify/src';
  import { keyboardShortcuts } from '../js/store.js';

  let timeout = null;

  const rules = [
    key => key.length >= 1 || 'Please input a key'
  ];

  const toDisplayName = actionName => actionName
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase();

  const updateKey = action => e => {
    if (timeout != null) clearTimeout(timeout);
    // delay changing shortcut
    timeout = setTimeout(() => {
      const shorts = {...$keyboardShortcuts};
      shorts[action] = e.target.value;
      keyboardShortcuts.set(shorts);
    }, 1000);
  };
</script>

<Subheader>
  Keyboard shortcuts
</Subheader>

{#each Object.entries($keyboardShortcuts) as [action, key]}
  <Row>
    <Col>
      <span class="option-label">{toDisplayName(action)}</span>
    </Col>
    <Col>
      <TextField dense on:input={updateKey(action)} {rules} value={key} />
    </Col>
  </Row>
{/each}
