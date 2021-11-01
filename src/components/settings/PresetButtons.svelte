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
</script>

{#each [1, 2] as i}
  <div class="flex gap-2 py-1">
    <Button add="flex-1" on:click={() => { updatePreset(2 * i - 1); }} color="dark" light={active === 2 * i - 1}>
      {active !== 2 * i - 1 ? `Preset ${2 * i - 1}` : `Save Preset ${2 * i - 1}`}
    </Button>
    <Button add="flex-1" on:click={() => { updatePreset(2 * i); }} color="dark" light={active === 2 * i}>
      {active !== 2 * i ? `Preset ${2 * i}` : `Save Preset ${2 * i}`}
    </Button>
  </div>
{/each}
