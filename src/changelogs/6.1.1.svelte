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
          The fullscreen button now correctly full-screens the entire LiveTL
          interface.
        </li>
      </ul>
      Known issues with this build:
      <ul>
        <li>
          When the chat side is set to LEFT, the panel size can be enlarged but
          not reduced.
        </li>
        <li>Vertical mode has not yet been implemented.</li>
      </ul>
      Please use our
      <a href="https://discord.gg/uJrV3tmthg" target="_blank">Discord server</a>
      for reporting any bugs, issues, or suggestions!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
