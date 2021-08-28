<script lang="ts">
  import {
    doSpeechSynth,
    speechVoiceName,
    speechVoiceNameSetting,
    speechSpeed,
    speechVolume,
    voiceNames
  } from '../../js/store.js';
  import { writable } from 'svelte/store';
  import Card from '../common/Card.svelte';
  import Slider from '../common/SliderStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Dropdown from '../common/DropdownStore.svelte';

  export let boundingDiv: HTMLElement;

  const store = writable('0');
  $: selectableLanguages = $voiceNames.map((n, i) => ({
    text: n,
    value: i.toString()
  }));
  $: store.set(selectableLanguages.find(l => l.text === $speechVoiceName)?.value || '0');
  $: speechVoiceNameSetting.set($voiceNames[parseInt($store)]);
</script>

<Card title="Speech" icon="record_voice_over">
  <Checkbox name="Enable read-aloud mode" store={doSpeechSynth} />
  {#if $doSpeechSynth}
    <Slider name="Speech volume" store={speechVolume} min={0} max={1} step={0.01} />
    <Slider name="Speech speed" store={speechSpeed} min={0.5} max={2} step={0.01} />
    <Dropdown
      name="Speech synthesis voice"
      {store}
      items={selectableLanguages}
      {boundingDiv}
    />
  {/if}
</Card>
