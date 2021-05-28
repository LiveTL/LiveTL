<script>
  import { translatorMode } from '../js/translator-mode.js';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let container;

  const content = writable('');
  const recommendations = writable([]);

  onMount(() => {
    translatorMode(
      container.querySelectorAll('#input')[1], content, recommendations
    );
  });
</script>

<!-- The translation recommendations -->
{#if $recommendations.length == 0}
  <p>‍‍‍</p>
{/if}
<p>
  {#each $recommendations as recommend}
    <span>{recommend}</span>
  {/each}
</p>
