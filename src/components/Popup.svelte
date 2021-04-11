<script>
  import { MaterialApp } from 'svelte-materialify/src';
  import Options from './Options.svelte';

  export let name;
</script>

<MaterialApp theme="dark">
  <Options />
</MaterialApp>

<style>
  :global(html body) {
    min-width: 500px;
    min-height: 500px;
  }
</style>
