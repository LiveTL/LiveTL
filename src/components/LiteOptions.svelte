<script lang="ts">
  import {
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
  import ExpandingCard from './common/ExpandingCard.svelte';
  import ReadAloud from './settings/ReadAloud.svelte';
  import CommonFilterCards from './settings/CommonFilterCards.svelte';
  import SpamProtection from './settings/SpamProtection.svelte';

  let div: HTMLElement;
</script>

<div class="bg-dark-700 p-2" bind:this={div}>
  <Card title="General" icon="tune">
    <ExpandingCard title="About LiveTL" icon="info">
      <p class="m-4">
        LiveTL displays translations for streams and archives. <strong
          >Translations are provided by volunteer translators, not machines.</strong
        >
        <br /><br />
        Please consider installing the
        <a
          href="https://livetl.app/"
          target="_blank"
          class="text-blue-400 underline">LiveTL browser extension</a
        > to access exclusive features like custom filters, floating captions, and
        translator mode!
      </p>
    </ExpandingCard>
    <ImportExport />
    <Checkbox name="Show timestamps" store={showTimestamp} />
    <Checkbox
      name="Show screenshot and download buttons"
      store={enableExportButtons}
    />
  </Card>
  <CommonFilterCards {div} />
  <Card title="Font" icon="format_size">
    <Slider name="Font size" store={livetlFontSize} min={9} max={54} />
    <FontDemo fontSize={$livetlFontSize} />
  </Card>
  <Card title="Layout" icon="monitor">
    <div class="flex items-center gap-2">
      <h6>Text direction:</h6>
      <Radio store={textDirection} map={textDirectionMap} />
    </div>
  </Card>
  <ReadAloud boundingDiv={div} />
  <SpamProtection boundingDiv={div} />
</div>

<style>
  :global(body) {
    font-size: 1rem;
  }
</style>
