<script>
  import {
    chatZoom,
    doSpeechSynth,
    doTranslatorMode,
    showCaption,
    showModMessage,
    showTimestamp,
  } from "../js/store.js";
  import CheckOption from "./CheckOption.svelte";
  import SliderOption from "./SliderOption.svelte";
</script>

<CheckOption name="Show moderator messages" store={showModMessage} />
<SliderOption name="Chat zoom" store={chatZoom} />
<CheckOption name="Show timestamps" store={showTimestamp} />
<CheckOption name="Show captions" store={showCaption} />
<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
<CheckOption name="Auto-prefix chat messages" store={doTranslatorMode} />

<style>
</style>
