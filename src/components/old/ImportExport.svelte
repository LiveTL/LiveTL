<script>
  import { Button, Icon, Textarea } from 'svelte-materialify';
  import { mdiCheck, mdiClipboardOutline, mdiClose } from '@mdi/js';
  import { importStores, exportStores } from '../js/storage.js';
  import { compose } from '../js/utils.js';
  import Dialog from './Dialog.svelte';

  let isImporting = false;
  let value = '';
  let active = false;
  let width;
  let error = '';
  let success = '';

  function onImport() {
    isImporting = true;
    active = true;
  }

  function onExport() {
    isImporting = false;
    active = true;
  }

  function onImportRequest() {
    try {
      importStores(value);
      close();
    }
    catch (e) {
      error = 'Invalid settings syntax';
    }
  }

  const exportToClipboard = compose(
    navigator.clipboard.writeText.bind(navigator.clipboard),
    exportStores,
    () => success = 'Successfully copied!'
  );

  let display = false;
  $: if (!display) {
    isImporting = false;
    value = '';
    error = '';
    success = '';
  }

  const close = () => active = false;
</script>

<div>
  <div class="buttons {width < 350 ? 'vertical' : ''}" bind:clientWidth={width}>
    <Button class="import-button" style="margin-right: 2%;" on:click={onImport}>
      Import Settings
    </Button>
    <Button class="import-button" on:click={onExport}>Export Settings</Button>
  </div>

  <Dialog bind:display bind:active>
    <div style="text-align: left;" slot="default">
      <h6 style="margin-bottom: 10px;">
        {isImporting ? 'Import' : 'Export'} Settings
      </h6>
      <div style="display: {isImporting ? 'block' : 'none'};">
        <div
          style="display: {error ? 'block' : 'none'}; margin-bottom: 10px;"
          class="red-text"
        >
          {error}
        </div>
        <Textarea noResize bind:value color="blue">
          Enter your settings string (JSON)
        </Textarea>
      </div>
      <div style="display: {isImporting ? 'none' : 'block'};">
        <div
          style="display: {success ? 'block' : 'none'}; margin-bottom: 10px;"
          class="green-text"
        >
          {success}
        </div>
        <p>Click the clipboard icon to copy your settings.</p>
      </div>
    </div>
    <div slot="buttons">
      <Button
        icon
        class="green-text"
        on:click={isImporting ? onImportRequest : exportToClipboard}
      >
        <Icon path={isImporting ? mdiCheck : mdiClipboardOutline} />
      </Button>
      <Button icon class="red-text" on:click={close}>
        <Icon path={mdiClose} />
      </Button>
    </div>
  </Dialog>
</div>

<style>
  .buttons {
    text-align: center;
    margin-bottom: 1%;
  }

  .buttons :global(.import-button) {
    width: 45%;
  }

  .buttons.vertical :global(.import-button) {
    width: 100%;
    margin-bottom: 1%;
  }

  :global(label) {
    overflow: visible !important;
  }

</style>
