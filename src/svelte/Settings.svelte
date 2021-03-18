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

<CheckOption name="Show Moderator Messages" store={showModMessage} />
<SliderOption name="Chat Zoom" store={chatZoom} />
<CheckOption name="Show Timestamp" store={showTimestamp} />
<CheckOption name="Show Captions" store={showCaption} />
<CheckOption name="Read aloud mode" store={doSpeechSynth} />
<CheckOption name="Auto-prefix Chat Messages" store={doTranslatorMode} />

<style>
</style>
