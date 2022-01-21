<script lang="ts">
  import { twitchEnabled } from '../../js/store.js';
  import About from './About.svelte';
  import Card from '../common/Card.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import NonstoreCheckbox from '../common/Checkbox.svelte';
</script>

<Card title="Additional sites" icon="web">
  Enable LiveTL on:
  <NonstoreCheckbox label="YouTube" checked disabled />
  <Checkbox name="Twitch" store={twitchEnabled} />
</Card>
<Card title="About" icon="info">
  <About />
</Card>
