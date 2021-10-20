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
  <ExpansionPanel>
    <span slot="header">Spam protection update</span>
    <div>
      We've updated our spam detector so it can be selectively disabled for
      trusted users. Channel owners, verified users, MChad translators, etc.
      will not be banned based on message frequency by default. If you prefer,
      you can disable this change in the settings menu.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
