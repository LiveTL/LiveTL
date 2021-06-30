<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Upcoming news post on Reddit</span>
    <div>
      We have some exciting news to share with you regarding an all-new Android
      app, translation exports, external dedicated translator sources, and beta
      features! The post will be made public several hours after this update
      goes public. Be sure to bookmark the link!
      <br />
      <a href="https://livetl.app/en/news/latest" target="_blank">
        <img
          src="./img/6.4Post.png"
          style="width: 100%; height: auto;"
          alt="post"
        />Click here to see the post!</a
      >
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">HyperChat improvements</span>
    <div>
      HyperChat now supports initial chat message data support! What this means
      is that you no longer have to wait for the chat to load messages after
      opening a stream.
    </div>
  </ExpansionPanel>
</ExpansionPanels>
