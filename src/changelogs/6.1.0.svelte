<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    import V6 from './common/6.1.svelte';
    let value = [0];
  </script>
  
  <ExpansionPanels bind:value>
    <V6 />
  </ExpansionPanels>
  