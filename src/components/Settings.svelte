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
    usernameFilters,
    channelFilters,
  } from "../js/store.js";
  import {
    languageNameValues,
    TextDirection,
    VideoSide,
  } from "../js/constants.js";
  import CheckOption from "./options/Toggle.svelte";
  import SliderOption from "./options/Slider.svelte";
  import EnumOption from "./options/Radio.svelte";
  import SelectOption from "./options/Dropdown.svelte";
  export let isStandalone = false;
</script>

<SelectOption
  name="Language Filter"
  store={language}
  items={languageNameValues}
/>
{#if !isStandalone}
  <SliderOption name="Chat zoom" store={chatZoom} />
{/if}
<SliderOption name="LiveTL panel zoom" store={livetlZoom} />
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
{/if}
<CheckOption name="Show moderator messages" store={showModMessage} />
<CheckOption name="Show timestamps" store={showTimestamp} />
{#if !isStandalone}
  <CheckOption name="Show captions" store={showCaption} />
  {#if $showCaption}
    <SliderOption name="Caption duration" min={-1} store={captionDuration} />
    <SliderOption name="Caption zoom" store={captionZoom} />
  {/if}
{/if}
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} />
  <CheckOption name="Auto-prefix chat messages" store={doTranslatorMode} />
{/if}

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
