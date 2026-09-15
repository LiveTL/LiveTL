<script lang="ts">
  import { confirmDialog, isDark, dataTheme } from '../ts/storage';
  import { exioDialog, exioButton } from 'exio/svelte';
  import '../stylesheets/ui.css';
  import { onDestroy } from 'svelte';
  let title = '';
  $: title = $confirmDialog?.title ?? title;
  let message = '';
  $: message = $confirmDialog?.message ?? message;
  let action = {
    text: '',
    callback: () => {}
  };
  $: action = $confirmDialog?.action ?? action;
  let open = false;
  $: {
    const toOpen = Boolean($confirmDialog);
    open = false;
    setTimeout(() => {
      open = toOpen;
    }, 0);
  }
  onDestroy(() => {
    $confirmDialog = null;
  });
  let titleElem: HTMLDivElement, messageElem: HTMLParagraphElement, actionElem: HTMLButtonElement;
  $: if (titleElem) {
    titleElem.innerText = title;
  }
  $: if (messageElem) {
    messageElem.innerText = message;
  }
  $: if (actionElem) {
    actionElem.innerText = action.text;
  }
</script>

<svelte:window 
  on:keydown={e => {
    if (e.key === 'Escape') {
      $confirmDialog = null;
    }
  }}
/>

<dialog
  data-theme={$dataTheme}
  use:exioDialog={{
    backgroundColor: $isDark ? 'black' : 'white'
  }}
  {open}
  style="font-size: 1rem;"
>
  <div class="big-text select-none" bind:this={titleElem}>{title}</div>
  <p class="select-none" style="margin: revert;" bind:this={messageElem}>{message}</p>
  <div style="display: flex; justify-content: flex-end; gap: 10px;">
    <button on:click={() => ($confirmDialog = null)} use:exioButton>Cancel</button>
    <button on:click={() => {
      action.callback();
      $confirmDialog = null;
    }} use:exioButton class="red-bg" bind:this={actionElem}>{action.text}</button>
  </div>
</dialog>

<style>
  button {
    cursor: default;
    line-height: 1.325;
  }
</style>
