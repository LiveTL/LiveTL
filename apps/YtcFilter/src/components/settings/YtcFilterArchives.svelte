<script lang="ts">
  import '../../stylesheets/ui.css';
  import YtcFilterArchiveList from './YtcFilterArchiveList.svelte';
  import { exioButton, exioIcon, exioTextbox } from 'exio/svelte';
  import { importJsonDump } from '../../ts/ytcf-logic';
  let refreshFunc: any;
  export let isArchiveLoadSelection = false;
  let searchQuery = '';
  const closeFunc = () => {
    window.parent.postMessage({ type: 'archiveViewCloseRequest' }, '*');
  };
  const importFunc = async () => {
    await importJsonDump();
    refreshFunc();
  };
</script>

<div
  class="settings-title big-text"
  style="display: flex; justify-content: space-between; padding-right: 5px;"
>
  <span>Archives</span>
  <span style="margin-left: 5px; display: inline-flex;">
    {#if isArchiveLoadSelection}
      <button use:exioButton class="btn red-bg" on:click={closeFunc} style="margin-left: 5px;">
        <span use:exioIcon>close</span>
      </button>
    {/if}
  </span>
</div>
<div style="display: grid; grid-template-columns: 1fr auto auto; gap: 5px; margin: 10px; margin-right: 10px;">
  <input
    type="text"
    placeholder="Search"
    style="width: 100%; height: 32px; font-size: 1rem;"
    use:exioTextbox
    bind:value={searchQuery}
  />
  <button use:exioButton class="btn" on:click={refreshFunc}>
    <span use:exioIcon>refresh</span>
  </button>
  <button use:exioButton class="blue-bg" on:click={importFunc}>
    Upload
    <span use:exioIcon style="vertical-align: -2px;">upload</span>
  </button>
</div>
<YtcFilterArchiveList bind:refreshFunc {isArchiveLoadSelection} {searchQuery} />

<style>
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
