<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Spotlight translators temporarily</span>
    <div>
      You can now temporarily spotlight translators while watching a stream! If
      there are multiple translators active and you want to see messages from
      only one translator without having to ban everyone else, simply click the
      icon next to the translator name to only show their messages temporarily.
      <img
        src="./img/spotlight.png"
        style="width: 100%; height: auto;"
        alt="screenshot"
      />
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Auto-switch to vertical mode</span>
    <div>
      LiveTL will automatially switch to vertical mode if your screen is taller
      than it is wide. You can disable this feature in the settings menu.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Caption text bugfix</span>
    <div>
      The previous version had issues with the caption box disappearing
      occasionally. The issue has now been fixed.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Internal improvements</span>
    <div>
      As usual, there are a ton of internal improvements under the hood!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
