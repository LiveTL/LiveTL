<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  import V6 from "./common/6.2.svelte";
  let value = [];
</script>

<ExpansionPanels bind:value>
  <V6 />
</ExpansionPanels>
