<script lang="ts">
  export let block = true;
  export let small = false;
  export let xs = false;

  $: classes = 'material-icons icon select-none duration-200 ease-in ' +
    ($$props.class ?? '');
</script>

<i
  aria-hidden="true"
  class={classes}
  on:click
  class:block
  class:text-xs={xs}
  style="{small ? 'font-size: 1rem;' : ''}{$$props.style ?? ''}"
>
  <slot />
</i>
