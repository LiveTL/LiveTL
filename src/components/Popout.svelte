<script>
  import { Button, Icon, MaterialApp } from 'svelte-materialify/src';
  import { mdiClose, mdiCogOutline } from '@mdi/js';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection } from '../js/constants.js';
  import { textDirection } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  let settingsOpen = false;
  export let isStandalone = false;
  export let isResizing = false;
  export let updatePopupActive = false;
  document.title = 'LiveTL Popout';
</script>

<MaterialApp theme="dark">
  <div
    class="settingsButton {$textDirection === TextDirection.TOP
      ? 'bottom'
      : 'top'}Float"
    style="display: {isResizing ? 'none' : 'unset'};"
  >
    <Button fab size="small" on:click={() => (settingsOpen = !settingsOpen)}>
      <Icon path={settingsOpen ? mdiClose : mdiCogOutline} />
    </Button>
  </div>
  <Wrapper {isResizing}>
    <div style="display: {settingsOpen ? 'block' : 'none'};">
      <Options {isStandalone} />
    </div>
    <div style="display: {settingsOpen ? 'none' : 'block'};">
      <MessageDisplay
        direction={$textDirection}
        {settingsOpen}
        bind:updatePopupActive
      />
    </div>
  </Wrapper>
</MaterialApp>

<style>
  .bottomFloat {
    bottom: 0px;
  }
  .topFloat {
    top: 0px;
  }
  .settingsButton {
    position: absolute;
    right: 0px;
    padding: 5px;
    z-index: 100;
  }
  :global(body) {
    overflow: hidden;
  }
  :global(.s-app) {
    height: 100%;
  }
  :global(.s-btn) {
    vertical-align: top !important;
  }
</style>
