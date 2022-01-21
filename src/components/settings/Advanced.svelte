<script lang="ts">
  import { twitchEnabled } from '../../js/store.js';
  import About from './About.svelte';
  import Card from '../common/Card.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
</script>

<Card title="Additional sites support" icon="web">
  <Checkbox name="Twitch" store={twitchEnabled} />
</Card>
<Card title="About" icon="info">
  <About />
</Card>
