<script lang="ts">
  import {
    captionDuration,
    captionFontSize,
    videoSideSetting,
    chatZoom,
    livetlFontSize,
    showCaption,
    showTimestamp,
    textDirection,
    enableCaptionTimeout,
    chatSplit,
    enableExportButtons,
    enableFullscreenButton,
    autoVertical,
    displayMode,
    autoLaunchMode
  } from '../../js/store.js';
  import {
    DisplayMode,
    textDirectionMap,
    videoSideMap,
    chatSplitMap,
    autoLaunchModeItems
  } from '../../js/constants.js';
  import FontDemo from './FontDemo.svelte';
  import ImportExport from './ImportExport.svelte';
  import PresetButtons from './PresetButtons.svelte';
  import Slider from '../common/SliderStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Radio from '../common/RadioGroupStore.svelte';
  import Card from '../common/Card.svelte';
  import ReadAloud from './ReadAloud.svelte';
  import Dropdown from '../common/DropdownStore.svelte';
  import ExpandingCard from '../common/ExpandingCard.svelte';

  let div: HTMLElement;
</script>

<div bind:this={div}>
  <ImportExport />
  <Card title="Font" icon="format_size">
    <Slider
      name="Chat zoom"
      store={chatZoom}
      min={0.5}
      max={2}
      step={0.1}
      showValueSuffix="x"
    />
    <Slider name="Font size" store={livetlFontSize} min={9} max={54} />
    <FontDemo fontSize={$livetlFontSize} />
  </Card>
  <Card title="Layout" icon="monitor">
    <div class="flex items-center gap-2">
      <h6>Text direction:</h6>
      <Radio store={textDirection} map={textDirectionMap} />
    </div>
    {#if $displayMode === DisplayMode.FULLPAGE}
      <div class="flex items-center gap-2">
        <h6>Video side:</h6>
        <Radio store={videoSideSetting} map={videoSideMap} />
      </div>
      <div class="flex items-center gap-2">
        <h6>Chat split:</h6>
        <Radio store={chatSplit} map={chatSplitMap} />
      </div>
      <Checkbox
        name="Automatically adjust layout when window is thin"
        store={autoVertical}
      />
    {/if}
  </Card>
  <ExpandingCard title="Layout Presets" icon="list">
    <PresetButtons />
  </ExpandingCard>
  <Card title="General" icon="tune">
    <Dropdown
      name="Auto-launch mode"
      store={autoLaunchMode}
      items={autoLaunchModeItems}
      boundingDiv={div}
    />
    <Checkbox name="Show timestamps" store={showTimestamp} />
    <Checkbox
      name="Show screenshot and download buttons"
      store={enableExportButtons}
    />
    <Checkbox name="Show fullscreen button" store={enableFullscreenButton} />
  </Card>
  {#if $displayMode === DisplayMode.FULLPAGE}
    <Card title="Captions" icon="subtitles">
      <Checkbox name="Show captions" store={showCaption} />
      {#if $showCaption}
        <Slider
          name="Caption font size"
          store={captionFontSize}
          min={9}
          max={54}
        />
        <Checkbox
          name="Make captions disappear when inactive"
          store={enableCaptionTimeout}
        />
        {#if $enableCaptionTimeout}
          <Slider
            name="Disappear after"
            store={captionDuration}
            min={1}
            max={61}
            showValueSuffix={(value) => (value > 1 ? 'seconds' : 'second')}
          />
        {/if}
      {/if}
    </Card>
  {/if}
  <ReadAloud boundingDiv={div} />
</div>
