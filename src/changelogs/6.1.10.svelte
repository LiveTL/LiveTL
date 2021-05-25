<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0, 1];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Export screenshots</span>
    <div>
      You can now export translations as an image using the camera icon.
      <img
        src="./img/ImageExport.png"
        style="width: 100%; height: auto;"
        alt="screenshot"
      />
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Import/Export settings</span>
    <div>
      You can now import and export settings in JSON format. Use it for backing
      up your preferences or sharing them with friends!
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Welcome page on install</span>
    <div>
      A welcome page is shown upon first install. This change does not affect
      existing installations.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
