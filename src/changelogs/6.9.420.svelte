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
      We've updated our spam detector so it is disabled for MChad translations.
      Users on MChad undergo a verification processs -- therefore, they will not
      be limited by message frequency.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
