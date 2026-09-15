<script lang="ts">
  import Dialog from 'smelte/src/components/Dialog';
  import { quadIn } from 'svelte/easing';
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
  // Smelte's default is `{ duration: 150, easing: quadIn, delay: 150 }` which adds 150ms of dead
  // time before the open animation even starts. Drop the delay so the popup appears immediately.
  const transitionProps = { duration: 120, easing: quadIn, delay: 0 };
  $: classes = `items-center z-50 rounded p-4 shadow hc-dialog-font ${bgColor}` +
    ' max-h-full overflow-y-auto text-xs ' +
    (expandWidth ? 'w-full mx-2 ' : ' ') +
    ($$props.class ?? '');
</script>
<Dialog bind:value={active} classes={classes} {transitionProps}>
  <div slot="title" class="flex flex-row items-center">
    <div class="flex-1">
      <slot name="title">
        <h6>{title}</h6>
      </slot>
    </div>
    {#if !noCloseButton}
      <Button color="error" icon="close" on:click={() => (active = false)} />
    {/if}
  </div>
  <slot />
  <slot name="actions" slot="actions" />
</Dialog>

<style>
  :global(.hc-dialog-font) {
    font-family: var(--pure-material-font, "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system, sans-serif);
  }
</style>
