<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Better screenshot export rendering</span>
    <div>
      Screenshot exports previously had a blue tint applied due to the
      accidental inclusion of splash animations in the screenshotter. The
      animated blue splash effect has been removed from the screenshotter.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Scroll to bottom behavior patch</span>
    <div>
      The scroll to bottom button is now automatically hidden when the user, you
      guessed it, scrolls to the bottom of the page.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">What we're working on</span>
    <div>
      After the previous LiveTL update for Android, we heard from users that
      their devices were overheating or even crashing. We've since reverted the
      update, and are now switching gears to bringing the entire desktop version
      to the mobile app in a more stable and reliable way. Stay tuned!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
