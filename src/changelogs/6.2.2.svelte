<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">HyperChat theme update</span>
    <div>The HyperChat theme now looks more pleasant!</div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">No Open Collective permissions</span>
    <div>
      Some users have expressed concerns about a recent permissions change
      needed for fetching donation statistics from Open Collective. The change
      has been reverted.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
