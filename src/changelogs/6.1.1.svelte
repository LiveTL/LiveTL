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
      This build includes several bug fixes.
      <ul>
        <li>
          The fullscreen button now correctly full-screens the entire LiveTL
          interface.
        </li>
      </ul>
    </div>
  </ExpansionPanel>
</ExpansionPanels>
