<script>
  import {
    doSpeechSynth,
    speechVoiceName,
    speechSpeed,
    speechVolume
  } from '../../js/store.js';
  import { getAllVoiceNames } from '../../js/utils.js';
  import CheckOption from '../options/Toggle.svelte';
  import SliderOption from '../options/Slider.svelte';
  import Dropdown from '../options/Dropdown.svelte';
  import { writable } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';

  const store = writable(0);
  const voiceNames = getAllVoiceNames();
  const selectableLanguages = voiceNames.map((n, i) => ({
    name: n,
    value: i
  }));
  /**
  * @type {any[]}
  */
  let subs = [];
  onMount(() => {
    subs = [
      store.subscribe(v => $speechVoiceName = voiceNames[v]),
      speechVoiceName.subscribe(v => {
        $store = parseInt(selectableLanguages.find(l => l.name == v)?.value || '0'); 
      })
    ];
  });
  onDestroy(() => {
    subs.forEach(s => s());
  });
</script>

<CheckOption name="Read-aloud mode" store={doSpeechSynth} />
{#if $doSpeechSynth}
  <SliderOption name="Speech volume" store={speechVolume} min={0} max={1} />
  <SliderOption name="Speech speed" store={speechSpeed} min={0.5} max={2} />
  <Dropdown name="Voice" {store} items={selectableLanguages} />
{/if}
