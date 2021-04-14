<script>
  import {
    captionDuration,
    captionFontSize,
    videoSide,
    chatZoom,
    livetlFontSize,
    doSpeechSynth,
    doTranslatorMode,
    showCaption,
    showTimestamp,
    speechVolume,
    textDirection,
    enableCaptionTimeout
  } from '../../js/store.js';
  import { TextDirection, VideoSide } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import SliderOption from '../options/Slider.svelte';
  import EnumOption from '../options/Radio.svelte';
  import FontDemo from '../FontDemo.svelte';
  export let isStandalone = false;
</script>

<!-- {#if !isStandalone} -->
<SliderOption name="Chat zoom" store={chatZoom} />
<!-- {/if} -->
<SliderOption name="Font size" store={livetlFontSize} min={9} max={54} />
<FontDemo fontSize={$livetlFontSize} />
<div>
  <EnumOption
    name="Text direction:"
    options={Object.keys(TextDirection)}
    store={textDirection}
  />
  <!-- {#if !isStandalone} -->
  <EnumOption
    name="Video side:"
    options={Object.keys(VideoSide)}
    store={videoSide}
  />
  <!-- {/if} -->
</div>
<CheckOption name="Show timestamps" store={showTimestamp} />
<!-- {#if !isStandalone} -->
<CheckOption name="Show captions" store={showCaption} />
{#if $showCaption}
  <SliderOption
    name="Caption font size"
    store={captionFontSize}
    min={9}
    max={54}
  />
  <CheckOption
    name="Make captions disappear when inactive"
    store={enableCaptionTimeout}
  />
  {#if $enableCaptionTimeout}
    <SliderOption
      name="Disappear after ({Math.round($captionDuration)} seconds)"
      store={captionDuration}
      min={2}
      max={61}
    />
  {/if}
{/if}
<!-- {/if} -->
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} />
  <CheckOption name="Auto-prefix chat messages" store={doTranslatorMode} />
{/if}
