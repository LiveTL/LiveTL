<script>
  import {
    captionDuration,
    captionFontSize,
    videoSide,
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
    enableFullscreenButton
  } from '../../js/store.js';
  import { ChatSplit, TextDirection, VideoSide } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import SliderOption from '../options/Slider.svelte';
  import EnumOption from '../options/Radio.svelte';
  import FontDemo from '../FontDemo.svelte';
  import ImportExport from '../ImportExport.svelte';
  export let isStandalone = false;
</script>

<ImportExport />
<!-- {#if !isStandalone} -->
<SliderOption name="Chat zoom" store={chatZoom} />
<!-- {/if} -->
<SliderOption name="Font size" store={livetlFontSize} min={9} max={54} thumb />
<FontDemo fontSize={$livetlFontSize} />
<div>
  <EnumOption
    name="Text direction:"
    options={Object.keys(TextDirection)}
    store={textDirection}
  />
  {#if !isStandalone}
    <EnumOption
      name="Video side:"
      options={Object.keys(VideoSide)}
      store={videoSide}
    />
    <EnumOption
      name="Chat split:"
      options={Object.keys(ChatSplit)}
      store={chatSplit}
    />
  {/if}
</div>
<CheckOption name="Show timestamps" store={showTimestamp} />
{#if !isStandalone}
  <CheckOption name="Show captions" store={showCaption} />
{/if}
{#if $showCaption}
  <SliderOption
    name="Caption font size"
    store={captionFontSize}
    min={9}
    max={54}
    thumb
  />
  <CheckOption
    name="Make captions disappear when inactive"
    store={enableCaptionTimeout}
  />
  {#if $enableCaptionTimeout}
    <SliderOption
      name="Disappear after (seconds)"
      store={captionDuration}
      min={1}
      max={61}
      thumb
    />
  {/if}
{/if}
<!-- {/if} -->
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} min={0} max={1} />
{/if}
<CheckOption
  name="Show screenshot and download buttons"
  store={enableExportButtons}
/>
{#if !isStandalone}
  <CheckOption name="Show fullscreen button" store={enableFullscreenButton} />
{/if}
