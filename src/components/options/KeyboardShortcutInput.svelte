<script>
  import { createEventDispatcher } from 'svelte';
  import { Button } from 'svelte-materialify/src';

  /** @type {String} */
  export let shortcut;

  let isRecording = false;
  let recordedShortcut = '';

  const dispatch = createEventDispatcher();
  const modifierKeys = new Set(['Alt', 'Control', 'Meta', 'Shift']);
  const displayKeyName = key => {
    if (!key) return '';
    if (key == 'Enter') return '<Enter>';
    if (key == ' ') return '<Space>';
    return key;
  };

  const recordShortcut = e => {
    if (!isRecording) return;
    e?.preventDefault();
    const keyName = !modifierKeys.has(e?.key) ? displayKeyName(e?.key) : '';
    recordedShortcut = [
      e?.shiftKey ? 'shift': '',
      e?.ctrlKey ? 'ctrl': '',
      e?.altKey ? 'alt': '',
      keyName
    ].filter(Boolean).join('+');
    if (!keyName) return;
    isRecording = false;
    shortcut = recordedShortcut;
    dispatch('change', { shortcut });
  };
</script>

<svelte:window on:keydown={recordShortcut} />

{#if isRecording}
  <span class="option-label">{recordedShortcut}</span>
{:else}
  <Button on:click={() => [isRecording = true, recordedShortcut = '']}>
    {shortcut}
  </Button>
{/if}
