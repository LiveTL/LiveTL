<script lang="ts">
  import Button from 'smelte/src/components/Button';
  
  export let deletePreset: (number: number) => {};
  export let updatePreset: (number: number) => {};

  export let isDeleting: boolean = false;
  export let active: number = 0;
  export let number: number = 0;
</script>

<Button 
  add="flex-1" 
  on:click={() => { 
    isDeleting ? 
      deletePreset(number) : 
      updatePreset(number); 
  }} 
  color="dark" 
  light={ active === number && !isDeleting }
>
  {
    isDeleting ? 
      `Delete Preset ${number}` : 
      active !== number ? 
        `Preset ${number}` : 
        `Save Preset ${number}`
  }
</Button>