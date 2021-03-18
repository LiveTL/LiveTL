<script>
  import {
    captionDuration,
    captionZoom,
    videoSide,
    chatZoom,
    doSpeechSynth,
    doTranslatorMode,
    showCaption,
    showModMessage,
    showTimestamp,
    speechVolume,
    textDirection,
  } from "../js/store.js";
  import { TextDirection, VideoSide } from "../js/constants.js";
  import CheckOption from "./CheckOption.svelte";
  import SliderOption from "./SliderOption.svelte";
  import EnumOption from "./EnumOption.svelte";
</script>

<!--TODO language select-->
<CheckOption name="Show moderator messages" store={showModMessage} />
<SliderOption name="Chat zoom" store={chatZoom} />
<CheckOption name="Show timestamps" store={showTimestamp} />
<EnumOption
  name="Text direction:"
  options={Object.keys(TextDirection)}
  store={textDirection} />
<EnumOption
  name="Video side:"
  options={Object.keys(VideoSide)}
  store={videoSide} />
<CheckOption name="Show captions" store={showCaption} />
<SliderOption name="Caption duration" min={-1} store={captionDuration} />
<SliderOption name="Caption zoom" store={captionZoom} />
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
<SliderOption name="Speech volume" store={speechVolume} />
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
