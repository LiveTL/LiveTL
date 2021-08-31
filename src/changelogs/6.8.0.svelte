<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Video loading fixes</span>
    <div>
      Previously, YouTube and/or streamers could block third-party sites from
      opening some videos. This prevented users from watching streams and
      certain channels in the full-page LiveTL viewer. We've come up with a
      sort-of-functional workaround that forces videos to play anyway! Some
      videos that were unavailable before can now play (with occasional hiccups)
      in the full-page LiveTL viewer, not just in embedded or popout mode.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Translator mode macro fixes</span>
    <div>
      The macro feature in translator mode was partially broken in some corner
      cases. These issues have been fixed.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
