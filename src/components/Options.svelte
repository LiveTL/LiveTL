<script lang="ts">
  import Settings from './Settings.svelte';
  import dark from 'smelte/src/dark';
  import { paramsStandalone, isTwitch } from '../js/constants.js';

  // So options_ui css isn't shit
  dark().set(true);
</script>

<svelte:head>
  {#if paramsStandalone}
    <title>LiveTL{isTwitch ? ' (Twitch)' : ''} Settings</title>
  {/if}
</svelte:head>

<div class="bg-dark-700" style='scrollbar-width: thin; scrollbar-color: #888 transparent;'>
  <Settings />
</div>

<style>
  :global(::-webkit-scrollbar) {
    width: 4px;
    height: 4px;
  }
  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(::-webkit-scrollbar-thumb) {
    background: #888;
  }
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #555;
  }
</style>
