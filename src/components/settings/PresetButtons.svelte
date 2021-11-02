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

  let presetCount = $presets.length;
  function getPresetArray(presetCount: number) {
    let returnArr = [];
    for (let i = 1; i < Math.floor(presetCount / 2) + 1; i++) {
      returnArr.push([2 * i, 2 * i - 1]);
    }

    if (presetCount % 2 !== 0) { 
      returnArr.push([presetCount]);
    }
    return returnArr;
  }

  let isDeleting = false;
  let active = $activePreset;
  $: activePreset.set(active);

  async function updatePreset(number: number) {
    if (number !== active) {
      importStores(JSON.stringify($presets[number - 1]));
      active = number;
      return;
    }

    const presetData = $presets;
    presetData[number - 1] = {
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
    presets.set(presetData);
  }

  async function deletePreset(number: number) {
    const presetData = $presets;
    presetData.splice(number - 1, 1);
    presets.set(presetData);
    presetCount -= 1;
  }

  async function addPreset() {
    const presetData = $presets;
    presetData.push({
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
    presets.set(presetData);
    presetCount += 1;
  }

</script>


{#each getPresetArray(presetCount) as [even, odd]}
  <div class="flex gap-2 py-1">
    {#if odd}
      <PresetButton 
        active = { active }
        isDeleting = { isDeleting }
        deletePreset = { deletePreset }
        updatePreset = { updatePreset }
        number = { odd }
      />
    {/if}
    <PresetButton 
      active = { active }
      isDeleting = { isDeleting }
      deletePreset = { deletePreset }
      updatePreset = { updatePreset }
      number = { even }
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