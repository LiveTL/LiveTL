<script>
  import { ExpansionPanel } from 'svelte-materialify';
</script>

<ExpansionPanel>
  <span slot="header">Screenshot translations</span>
  <div>
    You can now selectively export translations as an image using the camera
    icon!
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
    You can now import and export settings in JSON format. Use it for backing up
    your preferences or sharing them with friends!
  </div>
</ExpansionPanel>
<ExpansionPanel>
  <span slot="header">Welcome page on install</span>
  <div>
    A welcome page is shown upon first install. This change does not affect
    existing installations.
  </div>
</ExpansionPanel>
