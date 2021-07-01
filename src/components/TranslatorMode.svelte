<script>
  import { translatorMode } from '../js/translator-mode.js';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let container;

  const content = writable('');
  const recommendations = writable([]);
  const focusRec = writable(null);

  let focussed = 0;

  const chatbox = container.querySelectorAll('#input')[1];
  const hide = el => el.style.display = 'none';
  const hideRipples = () => document
    .querySelectorAll('paper-ripple')
    .forEach(hide);

  const onKeydown = e => {
    if (e.key === 'Tab') {
      e.stopPropagation();
      setTimeout(hideRipples);
      focussed++;
    }
  };

  onMount(() => {
    translatorMode(
      container.querySelectorAll('#input'), content, recommendations, focusRec
    );
    chatbox.addEventListener('keydown', onKeydown);
  });

  container.cleanUpCbs.push(() => chatbox.removeEventListener('keydown', onKeydown));
  $: reclen = $recommendations.length;
  $: focussed = reclen == 0 ? 0 : focussed % reclen;
  $: focusRec.set(reclen ? $recommendations[focussed] : null);
</script>

<!-- The translation recommendations -->
{#if $recommendations.length == 0}
  <!--Invisible chars-->
  <p>‍‍‍</p>
{/if}
<div class="recommends">
  {#each $recommendations as recommend, i}
    <div class:focussed={i == focussed}>{recommend}</div>
  {/each}
</div>

<style>
  .focussed {
    color: #0099FF;
  }

  .recommends {
    display: flex;
    flex-direction: row wrap;
  }

  .recommends > * {
    margin-right: 2rem;
  }
</style>
