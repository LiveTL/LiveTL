<script>
  import MaterialApp from 'svelte-materialify/src/components/MaterialApp/MaterialApp.svelte';
  import Options from './Options.svelte';
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
