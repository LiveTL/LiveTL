<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Automatic spam protection</span>
    <div>
      Introducing automatic spam message detection! You can now set thresholds
      to block excessive spammers. You can customize the thresholds in the
      settings menu.
      <img
        src="./img/SpamProtection.png"
        style="width: 100%; height: auto;"
        alt="screenshot"
      />
    </div>
  </ExpansionPanel>
</ExpansionPanels>
