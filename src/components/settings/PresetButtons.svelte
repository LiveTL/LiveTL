<script>
  import {
    captionDuration,
    captionFontSize,
    videoSideSetting,
    chatZoom,
    livetlFontSize,
    showCaption,
    showTimestamp,
    textDirection,
    enableCaptionTimeout,
    chatSplit,
    enableExportButtons,
    enableFullscreenButton,
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
      captionDuration: captionDuration.getEntire(),
      captionFontSize: captionFontSize.get(),
      videoSideSetting: videoSideSetting.get(),
      chatZoom: chatZoom.get(),
      livetlFontSize: livetlFontSize.get(),
      showCaption: showCaption.get(),
      showTimestamp: showTimestamp.get(),
      textDirection: textDirection.get(),
      enableCaptionTimeout: enableCaptionTimeout.get(),
      chatSplit: chatSplit.get(),
      enableExportButtons: enableExportButtons.get(),
      enableFullscreenButton: enableFullscreenButton.get(),
      autoVertical: autoVertical.get(),
      autoLaunchMode: autoLaunchMode.get(),
    }
    presets.set(presetData)
  }
</script>

<!-- TODO: Re-Write With A For Loop To Make It Potentially Cleaner -->
<div>
  <div class="flex gap-2 py-1">
    <Button add="flex-1" on:click={() => {updatePreset(1)}} color="dark" light={active === 1}>
      {active !== 1 ? 'Preset 1' : 'Save Preset 1'}
    </Button>
    <Button add="flex-1" on:click={() => {updatePreset(2)}} color="dark" light={active === 2}>
      {active !== 2 ? 'Preset 2' : 'Save Preset 2'}
    </Button>
  </div>
  <div class="flex gap-2 py-1">
    <Button add="flex-1" on:click={() => {updatePreset(3)}} color="dark" light={active === 3}>
      {active !== 3 ? 'Preset 3' : 'Save Preset 3'}
    </Button>
    <Button add="flex-1" on:click={() => {updatePreset(4)}} color="dark" light={active === 4}>
      {active !== 4 ? 'Preset 4' : 'Save Preset 4'}
    </Button>
  </div>
</div>