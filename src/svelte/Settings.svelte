<script>
  import {
    captionDuration,
    captionZoom,
    chatZoom,
    doSpeechSynth,
    doTranslatorMode,
    showCaption,
    showModMessage,
    showTimestamp,
    speechVolume,
  } from "../js/store.js";
  import CheckOption from "./CheckOption.svelte";
  import SliderOption from "./SliderOption.svelte";
</script>

<!--TODO language select-->
<CheckOption name="Show moderator messages" store={showModMessage} />
<SliderOption name="Chat zoom" store={chatZoom} />
<CheckOption name="Show timestamps" store={showTimestamp} />
<!--TODO text direction enum-->
<!--TODO chat side enum-->
<CheckOption name="Show captions" store={showCaption} />
<SliderOption name="Caption duration" min={-1} store={captionDuration} />
<SliderOption name="Caption zoom" store={captionZoom} />
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
<SliderOption name="Speech volume" store={speechVolume} />
<CheckOption name="Auto-prefix chat messages" store={doTranslatorMode} />

<style>
</style>
