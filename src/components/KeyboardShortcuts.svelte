<script>
  import { Col, Row, Subheader } from 'svelte-materialify/src';

  import { keyboardShortcuts } from '../js/store.js';
  import KeyboardShortcutInput from './options/KeyboardShortcutInput.svelte';

  let timeout = null;

  const toDisplayName = actionName => actionName
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase();

  const updateKey = action => e => {
    if (timeout != null) clearTimeout(timeout);
    // delay changing shortcut
    timeout = setTimeout(() => {
      const shorts = {...$keyboardShortcuts};
      shorts[action] = e.detail.shortcut;
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
      <KeyboardShortcutInput on:change={updateKey(action)} shortcut={key} />
    </Col>
  </Row>
{/each}
