<script lang="ts">
  import Button from 'smelte/src/components/Button';
  import Icon from 'smelte/src/components/Icon';
  import TextField from '../common/TextField.svelte';
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
  function renamePreset(presetNumber: number, name: string) {
    dispatch('renamePreset',
      { 
        presetNumber, 
        name 
      }
    );
  }

  export let isDeleting: boolean = false;
  export let activeNumber: number = 0;
  export let prefabNumber: number = 0;
  export let name: string = `Preset ${prefabNumber}`;

  export let forceEditFinish: boolean = false;

  let isEditing: boolean = false;
  const editingInputClass: string = "button text-center text-white rounded col-span-4 bg-gray-300 dark:bg-dark-400 uppercase text-sm font-medium relative";

  if (forceEditFinish) {
    isEditing = false;
    forceEditFinish = false;
  }
</script>

<div class="grid grid-cols-5 gap-2">
  {#if !isEditing}
    <Button 
      on:click={() => {
        isDeleting
          ? deletePreset(prefabNumber)
          : updatePreset(prefabNumber);
      }} 
      color="dark" 
      light={ activeNumber === prefabNumber && !isDeleting }
      add="col-span-4"
    >
      {
        isDeleting
          ? `Delete ${name}`
          : activeNumber !== prefabNumber
            ? name
            : `Save ${name}`
      }
    </Button>
  {:else}
    <input 
      autofocus
      class={editingInputClass} 
      bind:value={name}
      on:change={() => { renamePreset(prefabNumber, name); }}
      on:keypress={
        keyPressEvent => { 
          if (keyPressEvent.key === "Enter") { 
            renamePreset(prefabNumber, name); 
            isEditing = false; 
          }
        }
      }
    />
  {/if}
  <Button 
    add="flex content-center justify-center"
    color="success"
    on:click={() => (isEditing = !isEditing)}
  >
    <Icon>{"edit"}</Icon>
  </Button>
</div>
