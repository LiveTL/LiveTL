<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">MChad duplication timeframe adjustment</span>
    <div>
      Some MChad translators are using an artificial delay to sync their TLs
      better. We've adjusted the duplication checker timeframe to account for
      this.
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
