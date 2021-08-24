<script lang="ts">
  import Dialog from 'smelte/src/components/Dialog';

  /** Dialog title. */
  export let title = '';
  /** Whether dialog is shown. */
  export let value = false;
  /** Expanded width variant. */
  export let expandWidth = false;
</script>

<Dialog bind:value class="{expandWidth ? 'w-full mx-2' : ''} {$$props.class}">
  <slot name="title" slot="title">
    <h6>{title}</h6>
  </slot>
  <slot />
  <slot name="actions" slot="actions" />
</Dialog>
