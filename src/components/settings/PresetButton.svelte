<script lang="ts">
  import Button from 'smelte/src/components/Button';
  
  export let deletePreset: (number: number) => {};
  export let updatePreset: (number: number) => {};

  export let isDeleting: boolean = false;
  export let activeNumber: number = 0;
  export let prefabNumber: number = 0;
</script>

<Button 
  add="flex-1" 
  on:click={() => {
    isDeleting
      ? deletePreset(prefabNumber)
      : updatePreset(prefabNumber);
  }} 
  color="dark" 
  light={ activeNumber === prefabNumber && !isDeleting }
>
  {
    isDeleting
      ? `Delete Preset ${prefabNumber}`
      : activeNumber !== prefabNumber
        ? `Preset ${prefabNumber}`
        : `Save Preset ${prefabNumber}`
  }
</Button>