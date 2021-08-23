<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">HyperChat conflict resolution</span>
    <div>
      Previously, a conflict between HyperChat and LiveTL installations caused a
      popup to appear repeatedly. This issue has now been resolved.
    </div>
  </ExpansionPanel>
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
</ExpansionPanels>
