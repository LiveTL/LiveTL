<script>
  import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
  let value = [0];
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">Announcement on Reddit</span>
    <div>
      Our latest announcement post is now live!
      <br />
      <a href="https://livetl.app/en/news/latest" target="_blank">
        Click here to see the post!
        <img
          src="./img/6.4Post.png"
          style="width: 100%; height: auto;"
          alt="post"
        /></a
      >
    </div>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">HyperChat fixes</span>
    <div>Scrolling was broken for Firefox users. This has now been fixed.</div>
  </ExpansionPanel>
</ExpansionPanels>
