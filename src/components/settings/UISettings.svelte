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
    usernameFilters,
    channelFilters
  } from '../../js/store.js';
  import { TextDirection, VideoSide } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import SliderOption from '../options/Slider.svelte';
  import EnumOption from '../options/Radio.svelte';
  import SelectOption from '../options/Dropdown.svelte';
  export let isStandalone = false;
</script>

<!-- {#if !isStandalone} -->
<SliderOption name="Chat zoom" store={chatZoom} />
<!-- {/if} -->
<SliderOption name="Font size" store={livetlFontSize} min={9} max={54} />
<div
  style="
  margin-bottom: 20px;
  font-size: {Math.round(
    $livetlFontSize
  )}px;
  background-color: darken(var(--theme-cards), 50%);
  padding: 5px;
"
>
  Sample text ({Math.round($livetlFontSize)} point font)
</div>
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
  <SliderOption name="Caption duration" min={-1} store={captionDuration} />
  <SliderOption name="Caption zoom" store={captionFontSize} />
{/if}
<!-- {/if} -->
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} />
  <CheckOption name="Auto-prefix chat messages" store={doTranslatorMode} />
{/if}
