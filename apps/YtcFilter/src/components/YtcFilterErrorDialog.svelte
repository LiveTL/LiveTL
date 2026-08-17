<script lang="ts">
  import { errorDialog, isDark } from '../ts/storage';
  import { exioDialog, exioButton } from 'exio/svelte';
  import '../stylesheets/ui.css';
  import { onDestroy } from 'svelte';
  let title = '';
  $: title = $errorDialog?.title ?? title;
  let message = '';
  $: message = $errorDialog?.message ?? message;
  let action = {
    text: '',
    callback: () => {}
  };
  $: action = $errorDialog?.action ?? action;
  let open = false;
  $: {
    const toOpen = Boolean($errorDialog);
    open = false;
    setTimeout(() => {
      open = toOpen;
    }, 0);
  }
  onDestroy(() => {
    $errorDialog = null;
  });
</script>


<svelte:window 
  on:keydown={e => {
    if (e.key === 'Escape') {
      $errorDialog = null;
    }
  }}
/>

<dialog
  use:exioDialog={{
    backgroundColor: $isDark ? 'black' : 'white'
  }}
  {open}
  style="font-size: 1rem;"
>
  <div class="big-text select-none">{title}</div>
  <p class="select-none">{message}</p>
  <div style="display: flex; justify-content: flex-end; gap: 10px;">
    <button on:click={() => {
      action.callback();
      $errorDialog = null;
    }} use:exioButton class="red-bg">{action.text}</button>
  </div>
</dialog>
