<script lang="ts">
  import {
    chatZoom,
    livetlFontSize,
    showTimestamp,
    textDirection,
    enableExportButtons,
  } from '../js/store.js';
  import { textDirectionMap } from '../js/constants.js';
  import FontDemo from './settings/FontDemo.svelte';
  import ImportExport from './settings/ImportExport.svelte';
  import Slider from './common/SliderStore.svelte';
  import Checkbox from './common/CheckboxStore.svelte';
  import Radio from './common/RadioGroupStore.svelte';
  import Card from './common/Card.svelte';
  import ReadAloud from './settings/ReadAloud.svelte';

  let div: HTMLElement;
</script>

<div class="bg-dark-700" bind:this={div}>
  <Card title="About LiveTL" icon="info">
    <p class="m-4">
      Insert description and links here.
    </p>
  </Card>
  <ImportExport />
  <Card title="Font" icon="format_size">
    <Slider name="Chat zoom" store={chatZoom} min={0.5} max={2} step={0.1} />
    <Slider name="Font size" store={livetlFontSize} min={9} max={54} />
    <FontDemo fontSize={$livetlFontSize} />
  </Card>
  <Card title="Layout" icon="monitor">
    <div class="flex items-center gap-2">
      <h6>Text direction:</h6>
      <Radio store={textDirection} map={textDirectionMap} />
    </div>
  </Card>
  <Card title="General" icon="tune">
    <Checkbox name="Show timestamps" store={showTimestamp} />
    <Checkbox
      name="Show screenshot and download buttons"
      store={enableExportButtons}
    />
  </Card>
  <ReadAloud boundingDiv={div} />
</div>
