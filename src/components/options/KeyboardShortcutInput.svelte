<script>
  import { createEventDispatcher } from 'svelte';
  import { Button } from 'svelte-materialify/src';

  import { modifierKeys } from '../../js/constants.js';
  import { anyRecordingShortcut } from '../../js/store.js';
  import { keydownToShortcut } from '../../js/utils.js';

  /** @type {String} */
  export let shortcut;

  let isRecording = false;
  let recordedShortcut = '';

  const dispatch = createEventDispatcher();

  const startRecording = () => {
    isRecording = true;
    recordedShortcut = '';
    anyRecordingShortcut.set(true);
  };

  const recordShortcut = e => {
    if (!isRecording) return;
    e?.preventDefault();
    recordedShortcut = keydownToShortcut(e);
    if (!e?.key || modifierKeys.has(e?.key)) return;
    isRecording = false;
    shortcut = recordedShortcut;
    anyRecordingShortcut.set(false);
    dispatch('change', { shortcut });
  };
</script>

<svelte:window on:keydown={recordShortcut} />

{#if isRecording}
  <span class="option-label">{recordedShortcut || 'Press keys...'}</span>
{:else}
  <Button on:click={startRecording} disabled={$anyRecordingShortcut}>
    {shortcut}
  </Button>
{/if}
