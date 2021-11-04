<script lang="ts">
  import Button from 'smelte/src/components/Button';
  import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

  function updatePreset(presetNumber: number) {
    dispatch('updatePreset',
      { presetNumber }
    );
  }
  function deletePreset(presetNumber: number) {
    dispatch('deletePreset',
      { presetNumber }
    );
  }

  export let isDeleting: boolean = false;
  export let activeNumber: number = 0;
  export let prefabNumber: number = 0;
</script>

<Button 
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