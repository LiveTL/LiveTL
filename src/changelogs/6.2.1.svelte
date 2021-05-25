<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  import V6 from './common/6.2.svelte';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <V6 />
  <ExpansionPanel>
    <span slot="header">Collapsible initial message</span>
    <div>
      The "Welcome to LiveTL!" message can now be collapsed into a smaller box.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
