<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  /**
  * @type {number[] | undefined}
  */
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Full-screen button</span>
    <div>
      There is now a dedicated full-screen button in the LiveTL panel! If you
      don't need it, you can hide it in the settings menu.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">TL export/screenshot fixes</span>
    <div>
      The counter for TL screenshots and exports always showed 0. It now
      actually counts the number of TLs selected!
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">End-to-end tests</span>
    <div>
      A developer-focused improvement: we now have end-to-end tests! This should
      prevent us from pushing out any updates that break expected LiveTL
      behavior going forward. Hooray!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
