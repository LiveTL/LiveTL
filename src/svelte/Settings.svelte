<script>
  import {
    captionDuration,
    captionZoom,
    videoSide,
    chatZoom,
    livetlZoom,
    doSpeechSynth,
    doTranslatorMode,
    showCaption,
    showModMessage,
    showTimestamp,
    speechVolume,
    textDirection,
    language,
  } from "../js/store.js";
  import {
    languageNameValues,
    TextDirection,
    VideoSide,
  } from "../js/constants.js";
  import CheckOption from "./CheckOption.svelte";
  import SliderOption from "./SliderOption.svelte";
  import EnumOption from "./EnumOption.svelte";
  import SelectOption from "./SelectOption.svelte";
</script>

<SelectOption name="Language" store={language} items={languageNameValues} />
<SliderOption name="Chat zoom" store={chatZoom} />
<SliderOption name="LiveTL panel zoom" store={livetlZoom} />
<EnumOption
  name="Text direction:"
  options={Object.keys(TextDirection)}
  store={textDirection}
/>
<EnumOption
  name="Video side:"
  options={Object.keys(VideoSide)}
  store={videoSide}
/>
<CheckOption name="Show moderator messages" store={showModMessage} />
<CheckOption name="Show timestamps" store={showTimestamp} />
<CheckOption name="Show captions" store={showCaption} />
{#if $showCaption}
  <SliderOption name="Caption duration" min={-1} store={captionDuration} />
  <SliderOption name="Caption zoom" store={captionZoom} />
{/if}
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} />
{/if}
<CheckOption name="Auto-prefix chat messages" store={doTranslatorMode} />

<style>
  :global(label > .option-label) {
    padding-top: 0px;
    top: 0px;
  }

  :global(.option-label) {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    color: var(--theme-text-secondary);
    font-size: 16px;
  }
</style>
