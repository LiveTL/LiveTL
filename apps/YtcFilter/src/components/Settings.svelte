<script lang="ts">
  import '../stylesheets/scrollbar.css';
  import { onMount } from 'svelte';
  import Interface from './settings/InterfaceSettings.svelte';

  onMount(() => {
    document.body.classList.add('bg-gray-300');
  });
</script>

<svelte:head>
  <title>HyperChat Settings</title>
</svelte:head>

<div class="text-base p-2" style="scrollbar-width: thin; scrollbar-color: #888 transparent;">
  <Interface />
</div>
