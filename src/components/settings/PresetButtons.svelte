<script lang="ts">
  import { presetStores, presets, activePreset } from '../../js/store';
  import { importStores } from '../../js/storage';
  import Button from 'smelte/src/components/Button';
  import PresetButton from './PresetButton.svelte';

  $: presetAmount = $presets.length;

  let isDeleting = false;
  let activeNumber = $activePreset;
  $: activePreset.set(activeNumber);

  async function updatePreset(event: CustomEvent<{ presetNumber: number }>) {
    const presetNumber = event.detail.presetNumber;
    if (presetNumber !== activeNumber) {
      importStores(JSON.stringify($presets[presetNumber - 1]));
      activeNumber = presetNumber;
      return;
    }

    const presetsData = $presets;

    presetsData[presetNumber - 1] = Object.fromEntries(
      presetStores
        .map((store) => [store.name, store.get()])
        .concat([['name', presetsData[presetNumber - 1].name]])
    );
    presets.set(presetsData);
  }

  async function deletePreset(event: CustomEvent<{ presetNumber: number }>) {
    const presetsData = $presets;

    const presetNumber = event.detail.presetNumber;
    presetsData.splice(presetNumber - 1, 1);
    presets.set(presetsData);
  }

  async function addPreset() {
    const presetsData = $presets;

    presetsData.push(
      Object.fromEntries(
        presetStores
          .map((store) => [store.name, store.defaultValue])
          .concat([['name', 'Untitled Preset']])
      )
    );
    presets.set(presetsData);
  }

  async function renamePreset(
    event: CustomEvent<{ presetNumber: number, name: string }>
  ) {
    const updatedPresetName = event.detail.name;
    const presetNumber = event.detail.presetNumber;

    const presetsData = $presets;

    presetsData[presetNumber - 1].name = updatedPresetName;
    presets.set(presetsData);
  }
</script>

<div class="grid grid-cols-1 gap-2 py-1">
  {#each Array(presetAmount) as _, i}
    <PresetButton
      {activeNumber}
      {isDeleting}
      on:deletePreset={deletePreset}
      on:updatePreset={updatePreset}
      on:renamePreset={renamePreset}
      name={$presets[i].name}
      prefabNumber={i + 1}
    />
  {/each}
</div>
<div class={`grid ${isDeleting ? '' : 'grid-cols-2'} gap-2 py-1`}>
  {#if !isDeleting}
    <Button color="blue" on:click={addPreset}>Add Preset</Button>
  {/if}
  <Button
    color="error"
    on:click={() => {
      isDeleting = !isDeleting;
    }}
  >
    {isDeleting ? 'Stop Deleting' : 'Delete Presets'}
  </Button>
</div>
