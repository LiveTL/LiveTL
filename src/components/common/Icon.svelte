<script lang="ts">
  import Icon from 'smelte/src/components/Icon';

  export let block = true;
  export let small = false;
  export let xs = false;
</script>

<Icon
  class="{block ? 'block' : ''} {$$props.class}"
  on:click
  {small}
  {xs}
>
  <slot/>
</Icon>
