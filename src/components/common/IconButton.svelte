<script lang="ts">
  import Button from 'smelte/src/components/Button';

  export let icon: string;
  export let color = 'primary';
  export let transparent = true;
  export let round = true;
</script>

<Button
  {icon}
  {color}
  text={transparent}
  remove="p-4 px-4 rounded-full"
  add={round ? 'p-2 rounded-full' : 'py-px px-3'}
  on:click
/>
