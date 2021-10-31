<script>
  import MainPane from './MainPane.svelte';
  let settingsOpen;
  let settingsComponent;
  $: if (settingsOpen) {
    import('./LiteOptions.svelte').then((component) => {
      settingsComponent = component.default;
    });
  }
</script>

<MainPane bind:settingsOpen>
  <svelte:component this={settingsComponent} slot="settings" />
</MainPane>
