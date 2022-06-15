<script lang="ts">
  import Dialog from 'smelte/src/components/Dialog';
  import Button from './IconButton.svelte';

  /** Dialog title. */
  export let title = '';
  /** Whether dialog is shown. */
  export let active = false;
  /** Expanded width variant. */
  export let expandWidth = false;
  /** Background color. Default: 'bg-white dark:bg-dark-400'  */
  export let bgColor = 'bg-white dark:bg-dark-400';

  $: classes = `items-center z-50 rounded p-4 shadow ${bgColor}` +
    ' max-h-full overflow-y-auto ' +
    (expandWidth ? 'w-full mx-2 ' : ' ') +
    ($$props.class ?? '');

  $: console.log('ACTIVE', active);
</script>

<Dialog bind:value={active} classes={classes}>
  <div slot="title" class="flex flex-row items-center">
    <div class="flex-1">
      <slot name="title">
        <h6>{title}</h6>
      </slot>
    </div>
    <Button color="error" icon="close" on:click={() => (active = false)} />
  </div>
  <slot />
  <slot name="actions" slot="actions" />
</Dialog>
