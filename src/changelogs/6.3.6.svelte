<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">HyperChat now instantly loads</span>
    <div>
      Previously, users had to wait several seconds for HyperChat to start
      loading messages. It now instantly loads. No more waiting!
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Fixed non-dismissable update popups</span>
    <div>
      Some users using Firefox faced an issue where the update information popup
      was shown every time they opened LiveTL. This issue *should* now be fixed.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Migration to webpack v5</span>
    <div>
      Previously, LiveTL was bundled using webpack v4. Now that it is built
      using webpack v5, performance and reliability may be slightly improved.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Easter egg</span>
    <div>
      This update adds an easter egg that has been missing since LiveTL v5. Let
      us know in <a href="https://discord.gg/uJrV3tmthg">our Discord server</a> if
      you find it!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
