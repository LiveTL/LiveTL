<script>
  import { createEventDispatcher } from 'svelte';
  import { Button } from 'svelte-materialify/src';

  import { modifierKeys } from '../../js/constants.js';
  import { keydownToShortcut } from '../../js/utils.js';

  /** @type {String} */
  export let shortcut;

  let isRecording = false;
  let recordedShortcut = '';

  const dispatch = createEventDispatcher();

  const recordShortcut = e => {
    if (!isRecording) return;
    e?.preventDefault();
    recordedShortcut = keydownToShortcut(e);
    if (!e?.key || modifierKeys.has(e?.key)) return;
    isRecording = false;
    shortcut = recordedShortcut;
    dispatch('change', { shortcut });
  };
</script>

<svelte:window on:keydown={recordShortcut} />

{#if isRecording}
  <span class="option-label">{recordedShortcut || 'Press keys...'}</span>
{:else}
  <Button on:click={() => [isRecording = true, recordedShortcut = '']}>
    {shortcut}
  </Button>
{/if}
