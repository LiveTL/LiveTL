<script lang="ts">
  import Button from './Button.svelte';

  export let icon: string;
  export let color = 'primary';
  export let filled = false;
  export let noRound = false;
  export let noPadding = false;
  export let iconClass = '';

  const getAdd = (noRound: boolean, noPadding: boolean) => {
    let classes = '';
    if (!noRound) classes += ' rounded-full';
    if (!noPadding) classes += ' p-2';

    return `${classes} ${$$props.class ? $$props.class : ''}`;
  };
  $: add = getAdd(noRound, noPadding);
</script>

<Button
  {icon}
  {color}
  text={!filled}
  remove="p-4 px-4 rounded-full"
  {add}
  on:click
  {iconClass}
/>
