<script lang="ts">
  import { currentlyEditingPreset } from '../../js/store';
  import Button from 'smelte/src/components/Button';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function updatePreset(presetNumber: number) {
    dispatch('updatePreset', { presetNumber });
  }
  function deletePreset(presetNumber: number) {
    dispatch('deletePreset', { presetNumber });
  }
  function renamePreset(presetNumber: number, name: string) {
    dispatch('renamePreset', {
      presetNumber,
      name
    });
  }

  export let isDeleting = false;
  export let activeNumber = 0;
  export let prefabNumber = 0;
  export let name = `Preset ${prefabNumber}`;

  let isEditing = false;
  const editingInputClass =
    'button text-center text-white rounded col-span-4 bg-gray-300 dark:bg-dark-400 uppercase text-sm font-medium relative py-2 break-all h-full';

  $: if ($currentlyEditingPreset !== prefabNumber) isEditing = false;
</script>

<div class={`grid ${isDeleting ? '' : 'grid-cols-5'} gap-2`}>
  {#if !isEditing}
    <Button
      on:click={() => {
        isDeleting ? deletePreset(prefabNumber) : updatePreset(prefabNumber);
      }}
      color="dark"
      light={activeNumber === prefabNumber && !isDeleting}
      add="col-span-4"
    >
      {isDeleting
        ? `Delete ${name}`
        : activeNumber !== prefabNumber
        ? `Apply ${name}`
        : `Save ${name}`}
    </Button>
  {:else}
    <!-- svelte-ignore a11y-autofocus -->
    <input
      autofocus
      class={editingInputClass}
      bind:value={name}
      on:change={() => {
        renamePreset(prefabNumber, name);
      }}
      on:keypress={(keyPressEvent) => {
        if (keyPressEvent.key === 'Enter') {
          renamePreset(prefabNumber, name);
          isEditing = false;
        }
      }}
    />
  {/if}
  {#if !isDeleting}
    <Button
      add="h-full flex content-center justify-center rounded"
      remove="rounded p-4"
      color="success"
      icon="edit"
      on:click={() => {
        isEditing = !isEditing;
        if (isEditing) currentlyEditingPreset.set(prefabNumber);
      }}
    >
    </Button>
  {/if}
</div>
