<script>
  import { Button, Icon, Textarea } from 'svelte-materialify';
  import { mdiCheck, mdiClipboard, mdiClose } from '@mdi/js';
  import { importStores, exportStores } from '../js/storage.js';
  import { compose } from '../js/utils.js';
  import Dialog from './Dialog.svelte'; 
  import swal from 'sweetalert';

  let isImporting = false;
  let value = '';
  let active = false;
  let width;

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
      swal('Oops', 'Invalid settings syntax', 'error');
    }
  }

  const exportToClipboard = compose(
    navigator.clipboard.writeText.bind(navigator.clipboard),
    exportStores
  );

  let display = false;
  $: if (!display) {
    isImporting = false;
    value = '';
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
        <Textarea noResize bind:value color="blue">
          Enter your settings string (JSON)
        </Textarea>
      </div>
      <div style="display: {isImporting ? 'none' : 'block'};">
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

  .buttons :global(.import-button) {
    width: 45%;
  }

  .buttons.vertical :global(.import-button) {
    width: 100%;
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

  :global(.swal-modal) {
    background-color: #212121;
  }

  :global(.swal-text), :global(.swal-title) {
    color: #E5E5E5;
  }

  :global(.swal-button) {
    background-color: #2196F3 !important;
  }
</style>
