<script lang="ts">
  import { slide } from 'svelte/transition';
  import Card from './Card.svelte';
  import Icon from './Icon.svelte';

  export let title = '';
  export let expanded = false;
  export let slideDuration = 300;
  export let icon = '';
</script>

<Card
  {title}
  headerOnClick={() => (expanded = !expanded)}
  addHeaderClasses="hover:bg-dark-600 cursor-pointer"
  {icon}
>
  {#if expanded}
    <div transition:slide|local={{ duration: slideDuration }} class="p-2">
      <slot />
    </div>
  {/if}
  <Icon slot="header-end">
    {expanded ? 'arrow_drop_up' : 'arrow_drop_down'}
  </Icon>
</Card>
