<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  /**
  * @type {number[] | undefined}
  */
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">MChad API Improvements</span>
    <div>
      We've been working very closely with the developer of MChad to improve our
      integration. This update brings translation room retries, a move to https,
      fixes for message timestamps, and more! In the future, you will also be
      able to selectively filter individual translators from MChad as well.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
