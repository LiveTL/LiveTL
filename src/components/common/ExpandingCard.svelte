<script lang="ts">
  import { slide } from 'svelte/transition';
  import Card from './Card.svelte';

  export let title = '';
  export let expanded = false;
  export let slideDuration = 300;
  export let icon = '';
  export let nested = false;
</script>

<Card
  {title}
  headerOnClick={() => (expanded = !expanded)}
  addHeaderClasses="hover:bg-dark-500 cursor-pointer"
  {icon}
  headerEndIcon={expanded ? 'arrow_drop_up' : 'arrow_drop_down'}
  {nested}
  padded={false}
>
  {#if expanded}
    <div transition:slide|local={{ duration: slideDuration }} class="px-3 py-2">
      <slot />
    </div>
  {/if}
</Card>
