<script lang="ts">
  import { onMount } from 'svelte';
  import { isVisible } from '../js/store.js';

  let el: Element | null;

  onMount(() => {
    if (!el) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      isVisible.set(e.isIntersecting);
      console.log('intersecting', e.isIntersecting);
    }));
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div
  class="absolute left-1/2 transform -translate-x-1/2 p-2 z-20 bottom-0"
  style="filter: opacity(0);"
  bind:this={el}
/>

