<script lang="ts">
  import { twitchEnabled } from '../../js/store.js';
  import About from './About.svelte';
  import Card from '../../submodules/chat/src/components/common/Card.svelte';
  import Checkbox from '../../submodules/chat/src/components/common/CheckboxStore.svelte';
  import NonstoreCheckbox from '../../submodules/chat/src/components/common/Checkbox.svelte';
</script>

<Card title="Additional sites" icon="web">
  Enable LiveTL on:
  <NonstoreCheckbox label="YouTube" checked disabled />
  <Checkbox name="Twitch" store={twitchEnabled} />
</Card>
<Card title="About" icon="info">
  <About />
</Card>
