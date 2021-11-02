<script lang="ts">
  import {
    captionDuration,
    captionFontSize,
    captionWidth,
    captionLeft,
    captionTop,
    videoSideSetting,
    chatZoom,
    livetlFontSize,
    textDirection,
    chatSplit,
    activePreset,
    presets,
    videoPanelSize,
    chatSize,
    keyboardShortcuts,
    doTranslatorMode,
    doAutoPrefix,
    autoPrefixTag,
    macroTrigger,
    macros
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
    presetsData[presetNumber - 1] = {
      captionDuration: $captionDuration,
      captionFontSize: $captionFontSize,
      captionWidth: $captionWidth,
      captionLeft: $captionLeft,
      captionTop: $captionTop,

      videoSideSetting: $videoSideSetting,
      videoPanelSize: $videoPanelSize,

      chatZoom: $chatZoom,
      chatSize: $chatSize,
      chatSplit: $chatSplit,

      textDirection: $textDirection,
      livetlFontSize: $livetlFontSize,

      keyboardShortcuts: $keyboardShortcuts,

      doTranslatorMode: $doTranslatorMode,
      doAutoPrefix: $doAutoPrefix,
      autoPrefixTag: $autoPrefixTag,
      macroTrigger: $macroTrigger,
      macros: $macros
    };
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
    presetsData.push({
      captionDuration: captionDuration.defaultValue,
      captionFontSize: captionFontSize.defaultValue,
      captionWidth: captionWidth.defaultValue,
      captionLeft: captionLeft.defaultValue,
      captionTop: captionTop.defaultValue,

      videoSideSetting: videoSideSetting.defaultValue,
      videoPanelSize: videoPanelSize.defaultValue,

      chatZoom: chatZoom.defaultValue,
      chatSize: chatSize.defaultValue,
      chatSplit: chatSplit.defaultValue,

      textDirection: textDirection.defaultValue,
      livetlFontSize: livetlFontSize.defaultValue,

      keyboardShortcuts: keyboardShortcuts.defaultValue,

      doTranslatorMode: doTranslatorMode.defaultValue,
      doAutoPrefix: doAutoPrefix.defaultValue,
      autoPrefixTag: autoPrefixTag.defaultValue,
      macroTrigger: macroTrigger.defaultValue,
      macros: macros.defaultValue
    });
    presets.set(presetsData);
    presetAmount += 1;
  }

</script>


{#each getPresetArray(presetAmount) as [even, odd]}
  <div class="flex gap-2 py-1">
    {#if odd}
      <PresetButton 
        activeNumber = { activeNumber }
        isDeleting = { isDeleting }
        deletePreset = { deletePreset }
        updatePreset = { updatePreset }
        prefabNumber = { odd }
      />
    {/if}
    <PresetButton 
      activeNumber = { activeNumber }
      isDeleting = { isDeleting }
      deletePreset = { deletePreset }
      updatePreset = { updatePreset }
      prefabNumber = { even }
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