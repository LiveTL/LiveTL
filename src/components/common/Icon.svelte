<script lang="ts">
  export let block = true;
  export let small = false;
  export let xs = false;

  $: classes = 'material-icons icon select-none duration-200 ease-in ' +
    ($$props.class ? $$props.class : '');
</script>

<i
  aria-hidden="true"
  class={classes}
  on:click
  class:block
  class:text-base={small}
  class:text-xs={xs}
  style="font-size: 1.25em; {$$props.style ? $$props.style : ''}"
>
  <slot />
</i>
