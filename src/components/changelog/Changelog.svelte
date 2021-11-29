<script>
  export const version = '7.1.0';
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import LayoutPresets from './assets/LayoutPresets.png';
</script>

<ExpandingCard title="Layout presets" icon="windows">
  You can now save layout preferences as "presets" in the settings menu! With
  just a few clicks, you can jump between your favorite UI layout
  configurations.
  <img
    class="pt-2"
    src={LayoutPresets}
    alt="LiveTL Layout Presets"
  />
</ExpandingCard>
