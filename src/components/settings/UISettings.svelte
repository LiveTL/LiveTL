<script>
  import {
    captionDuration,
    captionZoom,
    videoSide,
    chatZoom,
    livetlFontSize,
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
  } from "../../js/store.js";
  import {
    languageNameValues,
    TextDirection,
    VideoSide,
  } from "../../js/constants.js";
  import CheckOption from "../options/Toggle.svelte";
  import SliderOption from "../options/Slider.svelte";
  import EnumOption from "../options/Radio.svelte";
  import SelectOption from "../options/Dropdown.svelte";
  export let isStandalone = false;
</script>

<div style="font-size: 16px !important; max-width: 500px; margin: auto;">
  <SelectOption
    name="Language Filter"
    store={language}
    items={languageNameValues}
  />
  {#if !isStandalone}
    <SliderOption name="Chat zoom" store={chatZoom} />
  {/if}
  <SliderOption name="Font size" store={livetlFontSize} min={6} max={69} />
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
</div>