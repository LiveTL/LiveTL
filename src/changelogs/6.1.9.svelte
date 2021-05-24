<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Import/Export settings</span>
    <div>
      You can now import and export settings in JSON format. Use it to copy your
      settings onto other computers, share with your friends, and back up your
      preferences!
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Welcome page on install</span>
    <div>
      A welcome page is shown upon first install. This change does not affect
      existing installations.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
