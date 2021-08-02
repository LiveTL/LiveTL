<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">MChad TLer blacklisting is here!</span>
    <div>
      MChad users are now handled as individual users, just like translators in
      the YouTube chat! No longer do you need to keep seeing Korean TLers when
      trying to get EN translations. There is also now a duplicate message
      checker to prevent messages from MChad users showing up twice.
      Additionally, we have addressed several issues with MChad stopping
      mid-stream.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Translator mode is here!</span>
    <div>
      Translators can now make use of our all-new auto-prefixing and macro
      system. No longer do you have to type [en] before every message! You can
      enable translator mode in the settings menu under the "Chat" tab.
      <img
        src="./img/TLMode.png"
        style="width: 100%; height: auto;"
        alt="screenshot"
      />
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">YouTube chat optimization</span>
    <div>
      We added a script to fix a memory leak in the YouTube chat. Special thanks
      to <a href="https://twitter.com/laversheet" target="_blank">@laversheet</a
      >!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
