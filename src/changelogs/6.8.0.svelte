<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">No more unavailable videos!</span>
    <div>
      Previously, YouTube and/or streamers blocked third-party sites from
      opening some streams. This prevented users from watching membership
      streams and certain channels in the full-page LiveTL viewer. We've come up
      with a workaround that forces videos to play anyway! No longer do you need
      to resort to LiveTL's embedded mode to watch restricted streams.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
