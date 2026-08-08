<script lang="ts">
  import Button from './IconButton.svelte';
  /** Dialog title. */
  export let title = '';
  /** Whether dialog is shown. */
  export let active = false;
  /** Expanded width variant. */
  export let expandWidth = false;
  /** Background color. Default: 'bg-white dark:bg-dark-400'  */
  export let bgColor = 'bg-white dark:bg-dark-800';
  export let noCloseButton = false;
  $: classes = `items-center z-50 rounded p-4 shadow hc-dialog-font ${bgColor}` +
    ' max-h-full overflow-y-auto text-xs ' +
    (expandWidth ? 'w-full mx-2 ' : ' ') +
    ($$props.class ?? '');
</script>
{#if active}
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50" role="presentation" on:click|self={() => (active = false)}>
    <div class={classes} role="dialog" aria-modal="true">
      <div class="flex flex-row items-center">
        <div class="flex-1"><slot name="title"><h6>{title}</h6></slot></div>
        {#if !noCloseButton}<Button color="error" icon="close" on:click={() => (active = false)} />{/if}
      </div>
      <slot />
      <slot name="actions" />
    </div>
  </div>
{/if}

<style>
  :global(.hc-dialog-font) {
    font-family: var(--pure-material-font, "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system, sans-serif);
  }
</style>
