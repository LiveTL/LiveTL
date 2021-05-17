<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">New features and fixes</span>
    <div>
      Below are features and fixes included in this update:
      <ul>
        <li>
          Vertical mode is finally here! You can now arrange the video and chat
          vertically for narrow screens.
        </li>
      </ul>
    </div>
  </ExpansionPanel>
</ExpansionPanels>
