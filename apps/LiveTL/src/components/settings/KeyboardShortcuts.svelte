<script>
  import Card from '../common/Card.svelte';

  import { keyboardShortcuts } from '../../js/store.js';
  import TranslatorMode from './TranslatorMode.svelte';
  import KeyboardShortcutInput from '../options/KeyboardShortcutInput.svelte';

  let timeout = null;

  const toDisplayName = actionName => actionName
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase();

  const updateKey = action => e => {
    if (timeout != null) clearTimeout(timeout);
    // delay changing shortcut
    timeout = setTimeout(() => {
      const shorts = { ...$keyboardShortcuts };
      shorts[action] = e.detail.shortcut;
      keyboardShortcuts.set(shorts);
    }, 1000);
  };
</script>

<Card title="Keyboard shortcuts" icon="keyboard">
  <div class="p-2 grid grid-cols-2 gap-2 items-center">
    {#each Object.entries($keyboardShortcuts) as [action, key]}
      <span>{toDisplayName(action)}</span>
      <KeyboardShortcutInput on:change={updateKey(action)} shortcut={key} />
    {/each}
  </div>
</Card>

<TranslatorMode />
