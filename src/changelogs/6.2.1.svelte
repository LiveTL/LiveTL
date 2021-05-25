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
  <ExpansionPanel>
    <span slot="header">New About tab</span>
    <div>
      There is now an "About" tab in the settings menu to see information about
      contributors, donators, and more.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
