<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">News post on Reddit</span>
    <div>
      We have some exciting news to share with you regarding an all-new Android
      app, translation exports, external dedicated translator sources, and beta
      features!
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
</ExpansionPanels>
