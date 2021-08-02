<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">MChad TLer blacklisted</span>
    <div>
      MChad users are now handled as individual users, just like translators in
      the YouTube chat! No longer do you need to keep seeing Korean TLers when
      trying to get EN translations.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
