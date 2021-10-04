<script>
  import { ExpansionPanel, ExpansionPanels, Icon } from 'svelte-materialify/src';
  import { mdiBug, mdiBullhorn, mdiReload, mdiRocketLaunch } from '@mdi/js';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header"><Icon path={mdiBullhorn} /> Translator Kamishiro Taishi's talk show</span>
    <div>
      You probably know Kamishiro Taishi, a legendary live translator in the
      Vtuber community. He will be hosting a new talk show called TLTalk
      that aims to introduce people involved with translating —
      such as translators and software developers — with a focus on those tied
      to Hololive and Vtubers in general. <a
        href="https://www.youtube.com/watch?v=cGcBHb6OcDc"
        target="_blank"
        style="font-size: 1.1rem;"
        >Make sure to tune in on YouTube and subscribe!
        <img
          src="./img/TLTalk.jpg"
          style="width: 100%; height: auto;"
          alt="TLTalk"
        /></a
      >
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header"><Icon path={mdiRocketLaunch} /> Auto-launch mode!</span>
    <div>
      You can now configure LiveTL to automatically launch in a specific mode!
      If you have the option enabled, LiveTL will either redirect, embed, or
      pop-up your preferred LiveTL viewing mode as soon as the chat begins
      loading.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header"><Icon path={mdiReload} /> Video loading fixes</span>
    <div>
      Previously, YouTube and/or streamers could block third-party sites from
      opening some videos. This prevented users from watching streams and
      certain channels in the full-page LiveTL viewer. We've come up with a
      sort-of-functional workaround that forces videos to play anyway! Some
      videos that were unavailable before can now play (with occasional hiccups)
      in the full-page LiveTL viewer, not just in embedded or popout mode.
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header"><Icon path={mdiBug} /> Translator mode macro fixes</span>
    <div>
      The macro feature in translator mode was partially broken in some corner
      cases. These issues have been fixed.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
