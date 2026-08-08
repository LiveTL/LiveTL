<script lang="ts">
  import Icon from '../../submodules/chat/src/components/common/Icon.svelte';
  export let block = true;
  export let small = false;
  export let xs = false;

  $: fontSize = small ? '1' : xs ? '0.75' : '1.25';
</script>

<Icon
  on:click
  class={$$props.class ?? ''}
  style="font-size: {fontSize}em; {$$props.style ?? ''}"
  {block}
>
  <slot />
</Icon>
