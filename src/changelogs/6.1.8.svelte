<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Vertical chat split</span>
    <div>
      You can now split the chat pane vertically like this:
      <img
        src="./img/VerticalChatSplit.png"
        style="width: 100%; height: auto;"
        alt="screenshot"
      />
    </div>
  </ExpansionPanel>
</ExpansionPanels>
