<script lang="ts">
  export let icon = '';
  export let color = 'primary';
  export let text = false;
  export let small = false;
  export let disabled = false;
  export let href = '';
  export let target = '';
  export let add = '';
  export let remove = '';
  export let iconClass = '';

  $: colorClass = text
    ? `text-${color}-500 hover:bg-${color}-transDark`
    : `bg-${color}-500 hover:bg-${color}-600 text-white`;
  $: classes = `inline-flex items-center justify-center rounded font-medium transition-colors ${colorClass} ${small ? 'px-2 py-1 text-sm' : 'px-4 py-2'} ${add} ${$$props.class ?? ''}`;
</script>

{#if href}
  <a class={classes} {href} {target} aria-disabled={disabled} on:click><slot /></a>
{:else}
  <button type="button" class={classes} {disabled} on:click>
    {#if icon}<span class="material-icons {iconClass}">{icon}</span>{/if}
    <slot />
  </button>
{/if}
