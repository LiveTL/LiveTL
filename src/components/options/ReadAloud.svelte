<script>
  import {
    doSpeechSynth,
    speechVoiceName,
    speechSpeed,
    speechVolume,
    voiceNames
  } from '../../js/store.js';
  import CheckOption from '../options/Toggle.svelte';
  import SliderOption from '../options/Slider.svelte';
  import Dropdown from '../options/Dropdown.svelte';
  import { writable } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';

  const store = writable('0');
  $: selectableLanguages = $voiceNames.map((n, i) => ({
      name: n,
      value: i.toString()
    }));
  $: speechVoiceName.set($voiceNames[$store]);
  $: store.set(selectableLanguages.find(l => l.name == $speechVoiceName)?.value || '0');
</script>

<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} min={0} max={1} />
  <SliderOption name="Speech speed" store={speechSpeed} min={0.5} max={2} />
  <Dropdown name="Speech synthesis voice" label={$speechVoiceName} {store} items={selectableLanguages} />
{/if}
