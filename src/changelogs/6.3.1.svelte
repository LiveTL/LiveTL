<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">HyperChat message deletions</span>
    <div>
      HyperChat now supports [message deleted] indicators (usually happens
      because a moderator bans a chat member).
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Clickable links in messages</span>
    <div>
      Both LiveTL and HyperChat now support clickable links in chat messages.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Touch support is back</span>
    <div>Touch support is back, with support for virtually all devices!</div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Translator macros (coming soon)</span>
    <div>
      We're currently working on translator input macros. You can add shorthands
      for common words using a custom dictionary (for example, you can make <code
        >/enpeko</code
      >
      expand to <code>[EN] PEKORA:</code>).
    </div>
  </ExpansionPanel>
</ExpansionPanels>
