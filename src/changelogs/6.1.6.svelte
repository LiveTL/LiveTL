<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    import V6 from './common/6.1.svelte';
    let value = [1];
</script>

<ExpansionPanels bind:value>
  <V6 />

  <ExpansionPanel>
    <span slot="header">Bug fixes</span>
    <div>
      Below are fixes included in this update:
      <ul>
        <li>
          Speech synthesis mode should now follow the filter language setting
        </li>
        <li>Changelogs now appear correctly in popout mode</li>
      </ul>
    </div>
  </ExpansionPanel>

  <ExpansionPanel>
    <span slot="header">Known issues</span>
    <div>
      <ul>
        <li>Vertical mode has not yet been implemented.</li>
      </ul>
    </div>
  </ExpansionPanel>
</ExpansionPanels>
