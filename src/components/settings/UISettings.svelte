<script lang="ts">
  import {
    captionDuration,
    captionFontSize,
    videoSideSetting,
    chatZoom,
    livetlFontSize,
    doSpeechSynth,
    showCaption,
    showTimestamp,
    speechVolume,
    textDirection,
    enableCaptionTimeout,
    chatSplit,
    enableExportButtons,
    enableFullscreenButton,
    autoVertical,
    displayMode
  } from '../../js/store.js';
  import {
    DisplayMode,
    textDirectionMap,
    videoSideMap,
    chatSplitMap
  } from '../../js/constants.js';
  import FontDemo from './FontDemo.svelte';
  import ImportExport from './ImportExport.svelte';
  import Slider from '../common/SliderStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Radio from '../common/RadioGroupStore.svelte';
</script>

<ImportExport />
<!-- {#if !isStandalone} -->
<Slider name="Chat zoom" store={chatZoom} min={0.5} max={2} step={0.1} />
<!-- {/if} -->
<Slider name="Font size" store={livetlFontSize} min={9} max={54} />
<FontDemo fontSize={$livetlFontSize} />
<div>
  <h6>Text direction:</h6>
  <Radio
    store={textDirection}
    map={textDirectionMap}
  />
</div>
{#if $displayMode === DisplayMode.FULLPAGE}
  <div>
    <h6>Video side:</h6>
    <Radio
      store={videoSideSetting}
      map={videoSideMap}
    />
    <Checkbox
      name="Enter vertical mode when window is thin"
      store={autoVertical}
    />
  </div>
  <div>
    <h6>Chat split:</h6>
    <Radio
      store={chatSplit}
      map={chatSplitMap}
    />
  </div>
{/if}
<Checkbox name="Show timestamps" store={showTimestamp} />
{#if $displayMode === DisplayMode.FULLPAGE}
  <Checkbox name="Show captions" store={showCaption} />
  {#if $showCaption}
    <Slider
      name="Caption font size"
      store={captionFontSize}
      min={9}
      max={54}
    />
    <Checkbox
      name="Make captions disappear when inactive"
      store={enableCaptionTimeout}
    />
    {#if $enableCaptionTimeout}
      <Slider
        name="Disappear after (seconds)"
        store={captionDuration}
        min={1}
        max={61}
      />
    {/if}
  {/if}
{/if}
<!-- {/if} -->
<Checkbox name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <Slider name="Speech volume" store={speechVolume} min={0} max={1} step={0.01} />
{/if}
<Checkbox
  name="Show screenshot and download buttons"
  store={enableExportButtons}
/>
<Checkbox name="Show fullscreen button" store={enableFullscreenButton} />
