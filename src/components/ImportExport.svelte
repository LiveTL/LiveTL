<script>
  import { Button, Dialog, Icon, MaterialApp, Textarea } from 'svelte-materialify';
  import { mdiCheck, mdiClose } from '@mdi/js';
  import { importStores, exportStores } from '../js/storage.js';

  let active = false;
  let isImporting = false;
  let isExporting = false;
  let value = '';

  function exitModal() {
    active = false;
  }

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

  $: if (!active) {
    isImporting = isExporting = false;
    value = '';
  }

  $: console.log('active', active);
  $: console.log('isImporting', isImporting);
</script>

<MaterialApp theme="dark">
  <div class="buttons">
    <Button style="width: 45%; margin-right: 2%;" on:click={onImport}>
      Import Settings
    </Button>
    <Button style="width: 45%" on:click={onExport}>
      Export Settings
    </Button>
  </div>

  <Dialog class="pa-4" bind:active>
    {#if isImporting}
      <div class="header">
        <h6>Import Settings</h6>
        <Button icon class="green-text">
          <Icon path={mdiCheck} />
        </Button>
        <Button icon class="red-text" on:click={exitModal}>
          <Icon path={mdiClose} />
        </Button>
      </div>
      <Textarea noResize bind:value color="blue">Enter your settings</Textarea>
    {/if}
  </Dialog>
</MaterialApp>

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
</style>
