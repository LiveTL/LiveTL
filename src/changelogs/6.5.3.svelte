<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Small bugfix</span>
    <div>
      I was stupid and I forgot to update the chat parser subcomponent before
      release. Whoops! Fixed now. -Kento
    </div>
  </ExpansionPanel>
</ExpansionPanels>
