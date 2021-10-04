<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from 'smelte/src/components/Button';

  import { modifierKeys } from '../../js/constants.js';
  import { anyRecordingShortcut } from '../../js/store.js';
  import { keydownToShortcut } from '../../js/utils.js';

  export let shortcut: string;

  let isRecording = false;
  let recordedShortcut = '';

  const dispatch = createEventDispatcher();

  const startRecording = () => {
    isRecording = true;
    recordedShortcut = '';
    anyRecordingShortcut.set(true);
  };

  const recordShortcut = (e: KeyboardEvent) => {
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
  <Button on:click={startRecording} disabled={$anyRecordingShortcut} color="dark">
    {shortcut}
  </Button>
{/if}
