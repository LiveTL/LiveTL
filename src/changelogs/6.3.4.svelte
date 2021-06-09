<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Fixed weird chat issues</span>
    <div>
      In the previous 2 versions, components of the translator mode were
      accidentally enabled (breaking chat behavior). They have now been
      disabled. Sorry for the inconvenience!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
