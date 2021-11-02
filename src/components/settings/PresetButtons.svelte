<script lang="ts">
  import {
    presetStores,
    presets,
    activePreset
  } from '../../js/store';
  import { importStores } from '../../js/storage';
  import Button from 'smelte/src/components/Button';
  import PresetButton from './PresetButton.svelte';

  let presetAmount = $presets.length;

  let isDeleting = false;
  let activeNumber = $activePreset;
  $: activePreset.set(activeNumber);

  async function updatePreset(presetNumber: number) {
    if (presetNumber !== activeNumber) {
      importStores(JSON.stringify($presets[presetNumber - 1]));
      activeNumber = presetNumber;
      return;
    }

    const presetsData = $presets;
    presetsData[presetNumber - 1] = Object.fromEntries(presetStores.map(store => [store.name, store.get()]));
    presets.set(presetsData);
  }

  async function deletePreset(presetNumber: number) {
    const presetsData = $presets;
    presetsData.splice(presetNumber - 1, 1);
    presets.set(presetsData);
    presetAmount -= 1;
  }

  async function addPreset() {
    const presetsData = $presets;
    presetsData.push(Object.fromEntries(presetStores.map(store => [store.name, store.defaultValue])));
    presets.set(presetsData);
    presetAmount += 1;
  }

</script>


<div class="grid grid-cols-2 gap-2 py-1">
  {#each Array(presetAmount) as _, i}
    <PresetButton 
      activeNumber = { activeNumber }
      isDeleting = { isDeleting }
      deletePreset = { deletePreset }
      updatePreset = { updatePreset }
      prefabNumber = { i + 1 }
    />
  {/each}
</div>
<div class="grid grid-cols-2 gap-2">
  <Button color="blue" on:click={() => { addPreset(); }}>
    Add Preset
  </Button>
  <Button color="error" on:click={() => { isDeleting = !isDeleting; }}>
    {
      isDeleting ? 'Stop Deleting' : 'Delete Presets'
    }
  </Button>
</div>