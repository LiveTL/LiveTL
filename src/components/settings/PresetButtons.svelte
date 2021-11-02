<script lang="ts">
  import { 
    presetStores, 
    presets, 
    activePreset
  } from '../../js/store';
  import { importStores } from '../../js/storage';
  import Button from 'smelte/src/components/Button';
  import PresetButton from './PresetButton.svelte'

  let presetAmount = $presets.length;
  function getPresetArray(presetAmount: number) {
    let returnArr = [];
    for (let i = 1; i < Math.floor(presetAmount / 2) + 1; i++) {
      returnArr.push([2 * i, 2 * i - 1]);
    }

    if (presetAmount % 2 !== 0) { 
      returnArr.push([presetAmount]);
    }
    return returnArr;
  }

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
    presetsData.push( Object.fromEntries(presetStores.map(store => [store.name, store.defaultValue])) );
    presets.set(presetsData);
    presetAmount += 1;
  }

</script>


{#each getPresetArray(presetAmount) as [evenNumber, oddNumber]}
  <div class="flex gap-2 py-1">
    {#if oddNumber}
      <PresetButton 
        activeNumber = { activeNumber }
        isDeleting = { isDeleting }
        deletePreset = { deletePreset }
        updatePreset = { updatePreset }
        prefabNumber = { oddNumber }
      />
    {/if}
    <PresetButton 
      activeNumber = { activeNumber }
      isDeleting = { isDeleting }
      deletePreset = { deletePreset }
      updatePreset = { updatePreset }
      prefabNumber = { evenNumber }
    />
  </div>
{/each}

<div class="flex gap-2 py-1">
  <Button 
    add="flex-1" 
    color="blue" 
    on:click={() => { addPreset(); }}
  >
    Add Preset
  </Button>
  <Button 
    add="flex-1" 
    color="error"
    on:click={() => { isDeleting = !isDeleting; }}
  >
    {
      isDeleting ? 
        'Stop Deleting' : 
        'Delete Presets'
    }
  </Button>
</div>