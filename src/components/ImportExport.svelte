<script>
  import { Button, Icon, Textarea } from 'svelte-materialify';
  import { mdiCheck, mdiClipboard, mdiClose } from '@mdi/js';
  import { importStores, exportStores } from '../js/storage.js';
  import Dialog from './Dialog.svelte'; 
  let isImporting = false;
  let isExporting = false;
  let value = '';
  let active = false;

  function onImport() {
    isImporting = true;
    isExporting = false;
    active = true;
  }

  function onExport() {
    isExporting = true;
    isImporting = false;
    active = true;
  }

  function onImportRequest() {
    try {
      importStores(value);
      close();
    }
    catch (e) {
      alert(`Invalid settings: ${e}`);
    }
  }

  async function exportToClipboard() {
    await navigator.clipboard.writeText(exportStores());
  }

  let display = false;
  $: if (!display) {
    isImporting = isExporting = false;
    value = '';
  }

  const close = () => active = false;
</script>

<div>
  <div class="buttons">
    <Button style="width: 45%; margin-right: 2%;" on:click={onImport}>
      Import Settings
    </Button>
    <Button style="width: 45%" on:click={onExport}>Export Settings</Button>
  </div>

  <Dialog bind:display bind:active>
    <div style="text-align: left;" slot="default">
      <h6 style="margin-bottom: 10px;">
        {isImporting ? 'Import' : isExporting ? 'Export' : 'You broke LiveTL'} Settings
      </h6>
      <div style="display: {isImporting ? 'block' : 'none'};">
        <Textarea noResize bind:value color="blue">
          Enter your settings string (JSON)
        </Textarea>
      </div>
      <div style="display: {isExporting ? 'block' : 'none'};">
        <p>Click the clipboard icon to copy your settings.</p>
      </div>
    </div>
    <div slot="buttons">
      <Button icon class="green-text" on:click={isImporting ? onImportRequest : exportToClipboard}>
        <Icon path={isImporting ? mdiCheck : mdiClipboard} />
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

  .header {
    display: flex;
    flex-direction: row;
    margin-bottom: 2%;
  }

  .header > * {
    flex-grow: 1;
  }

  :global(label) {
    overflow: visible !important;
  }

</style>
