<script lang="ts">
  import { importStores, exportStores } from '../../js/storage.js';
  import { compose } from '../../js/utils.js';
  import Button from 'smelte/src/components/Button';
  import Dialog from '../common/Dialog.svelte';
  import TextField from '../common/TextField.svelte';
  import IconButton from '../common/IconButton.svelte';

  let isImporting = false;
  let value = '';
  let active = false;
  let error = '';
  let success = '';

  function onImport () {
    isImporting = true;
    active = true;
  }

  function onExport () {
    isImporting = false;
    active = true;
  }

  function onImportRequest () {
    try {
      importStores(value);
      close();
    } catch (e) {
      console.error(e);
      error = 'Invalid settings syntax';
    }
  }

  const exportToClipboard = compose(
    navigator.clipboard.writeText.bind(navigator.clipboard),
    exportStores,
    () => (success = 'Successfully copied!')
  );

  $: if (!active) {
    isImporting = false;
    value = '';
    error = '';
    success = '';
  }

  const close = () => (active = false);
</script>

<div class="flex flex-wrap gap-2 py-1">
  <Button add="flex-grow" on:click={onImport}>Import Settings</Button>
  <Button add="flex-grow" on:click={onExport}>Export Settings</Button>
</div>

<Dialog
  bind:value={active}
  title="{isImporting ? 'Import' : 'Export'} Settings"
  expandWidth
>
  {#if isImporting}
    {#if error}
      <div class="text-error-500 mb-2">{error}</div>
    {/if}
    <TextField
      textarea
      placeholder="Enter your settings string (JSON)"
      dense
      add="resize-none"
      bind:value
    />
  {:else}
    {#if success}
      <div class="mb-2 text-success-500">{success}</div>
    {/if}
    <span>Click the copy icon to copy your settings.</span>
  {/if}
  <div slot="actions">
    <IconButton
      icon={isImporting ? 'check' : 'content_copy'}
      on:click={isImporting ? onImportRequest : exportToClipboard}
      color="success"
    />
  </div>
</Dialog>
