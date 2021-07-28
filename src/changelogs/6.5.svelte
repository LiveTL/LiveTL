<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Translator mode is here!</span>
    <div>
      Translators can now make use of our all-new auto-prefixing and macros
      system. No longer do you have to type [en] before every message! You can
      enable translator mode in the settings menu under the "Chat" tab.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Major internal improvements</span>
    <div>
      The entire message catching pipeline has been rewritten from scratch
      (special thanks to @ChrRubin!). <strong
        >If you have any friends that have previously had issues with LiveTL not
        working, let them know that this update may fix the issue!</strong
      >
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">MChad Improvements</span>
    <div>
      There is now a duplicate message checker to prevent messages from MChad
      users showing up twice. Additionally, we have addressed several issues
      with MChad stopping mid-stream.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">What's next</span>
    <div>
      <h2>Android</h2>
      Many of you may know that the Android app has been stuck on LiveTL v5 for many
      months. We are currently hard at work on upgrading the app to the newest version
      (v6). It's almost ready, so be sure to join our
      <a href="https://discord.gg/uJrV3tmthg" target="_blank">Discord server</a>
      and sign up for the Android beta role to be notified when it's ready!
      <h2>Extension</h2>
      We will be working on a migration to TypeScript and Smelte to make the interface
      more efficient and snappy. Stay tuned!
    </div>
  </ExpansionPanel>
</ExpansionPanels>
