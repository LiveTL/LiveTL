<script>
  import { translatorMode } from '../js/translator-mode.js';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let container;

  const content = writable('');
  const recommendations = writable([]);
  const focusRec = writable(null);

  let focused = 0;

  const dummyChatbox = document.createElement('input');
  const chatbox = container.querySelectorAll('#input')[1] ?? dummyChatbox;
  const hide = el => (el.style.display = 'none');
  const hideRipples = () => document
    .querySelectorAll('paper-ripple')
    .forEach(hide);

  const onKeydown = e => {
    if (e.key === 'Tab') {
      e.stopPropagation();
      setTimeout(hideRipples);
      focused++;
    }
  };

  onMount(() => {
    if (chatbox === dummyChatbox) {
      console.error('ERROR: chatbox failed to select for translator mode', window.location.href);
      return;
    }
    translatorMode(
      container.querySelectorAll('#input'), content, recommendations, focusRec
    );
    chatbox.addEventListener('keydown', onKeydown);
  });

  container.cleanUpCbs.push(() => chatbox.removeEventListener('keydown', onKeydown));
  $: reclen = $recommendations.length;
  $: focused = reclen === 0 ? 0 : focused % reclen;
  $: focusRec.set(reclen ? $recommendations[focused] : null);
</script>

<!-- The translation recommendations -->
{#if $recommendations.length === 0}
  <!--Invisible chars-->
  <p>‍‍‍</p>
{/if}
<div class="recommends">
  {#each $recommendations as recommend, i}
    <div class:focused={i === focused}>{recommend}</div>
  {/each}
</div>

<style>
  .focused {
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
