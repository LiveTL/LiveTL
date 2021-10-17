<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify/src';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">v6.9.420 😏 nice.</span>
    <div>
      v6.9.420 haha funni numbers lmao <br />
      An actual big update is coming soon, so look forward to it! 
    </div>
  </ExpansionPanel>
</ExpansionPanels>
