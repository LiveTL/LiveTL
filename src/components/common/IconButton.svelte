<script lang="ts">
  import Button from 'smelte/src/components/Button';

  export let icon: string;
  export let color = 'primary';
  export let px = '2';
  export let py = '2';
  export let transparent = true;
  export let round = true;
</script>

<Button
  {icon}
  {color}
  text={transparent}
  remove="p-4 px-4 rounded-full"
  add="px-{px} py-{py} {round ? 'rounded-full' : ''}"
  on:click
/>
