<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Improved read-aloud mode</span>
    <div>
      Read-aloud mode has been vastly improved! For those who don't know, LiveTL
      has a setting that will read out TLs. You can now change the speech voice
      and speed!
      <img
        src="./img/ReadAloud.png"
        style="width: 100%; height: auto;"
        alt="screenshot"
      />
    </div>
  </ExpansionPanel>
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
