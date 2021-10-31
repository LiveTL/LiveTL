<script>
  import {
    captionDuration,
    captionFontSize,
    videoSideSetting,
    chatZoom,
    livetlFontSize,
    textDirection,
    chatSplit,
    autoVertical,
    autoLaunchMode,
    activePreset,
    presets
  } from '../../js/store';
  import { importStores } from '../../js/storage'
  import Button from 'smelte/src/components/Button';

  $: active = $activePreset
  $: activePreset.set(active)

  /**
  * @param {number} number
  */
  async function updatePreset(number) {
    // Load The Active Preset And Return
    if (number !== active) { 
      importStores(JSON.stringify(presets.get()[number-1]))
      active = number;
      return;
    } 

    const presetData = presets.get()
    presetData[number-1] = {
      captionDuration: captionDuration.get(),
      captionFontSize: captionFontSize.get(),
      videoSideSetting: videoSideSetting.get(),
      chatZoom: chatZoom.get(),
      livetlFontSize: livetlFontSize.get(),
      textDirection: textDirection.get(),
      chatSplit: chatSplit.get(),
      autoVertical: autoVertical.get(),
      autoLaunchMode: autoLaunchMode.get(),
    }
    presets.set(presetData)
  }
</script>

{#each [1, 2] as i}
    <div class="flex gap-2 py-1">
      <Button add="flex-1" on:click={() => {updatePreset(2*i-1)}} color="dark" light={active === 2*i-1}>
        {active !== 2*i-1 ? `Preset ${2*i-1}` : `Save Preset ${2*i-1}`}
      </Button>
      <Button add="flex-1" on:click={() => {updatePreset(2*i)}} color="dark" light={active === 2*i}>
        {active !== 2*i ? `Preset ${2*i}` : `Save Preset ${2*i}`}
      </Button>
    </div>
{/each}
