<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    import V6 from './common/6.1.svelte';
    let value = [1];
</script>

<ExpansionPanels bind:value>
  <V6 />

  <ExpansionPanel>
    <span slot="header">Bug fixes and known issues</span>
    <div>
      This build fixes the following:
      <ul>
        <li>
          Resizing the pane size works properly when the video side is set to
          right.
        </li>
      </ul>
      Known issues with this build:
      <ul>
        <li>Vertical mode has not yet been implemented.</li>
        <li>Changelogs do not appear in popout mode.</li>
      </ul>
    </div>
  </ExpansionPanel>
</ExpansionPanels>
