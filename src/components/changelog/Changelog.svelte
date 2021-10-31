<script>
  export const version = '7.0.4';
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import ExpandLiveTL from './assets/ExpandLiveTL.png';
</script>

<ExpandingCard title="All-new interface... again!" icon="group">
  We re-wrote the entire interface! This time, we used a smaller library that
  should make everything more lightweight. Loading times and overall performance
  should be improved!
</ExpandingCard>
<ExpandingCard title="Introducing HyperChat v2!" icon="chat">
  HyperChat has also been rewritten with the same library as LiveTL v7, making
  it lighter and even faster than before! This new update also brings features
  such as pinned messages, super stickers, membership items, and membership
  milestone chats into HyperChat!
</ExpandingCard>
<ExpandingCard title="New feature in Embed Mode" icon="code">
  A new button has been added to Embed Mode that will open the stream in LiveTL
  Mode.
  <img
    class="pt-2"
    src="https://cdn.discordapp.com/attachments/786713928264319026/902138793501552660/unknown.png"
    alt="Expand LiveTL"
  />
</ExpandingCard>
<ExpandingCard title="Mchad integration update" icon="cloud">
  Mchad will no longer show translations for languages other than what is set
  in your language filter, as long as the Mchad translator properly set the
  correct language tag to their rooms.
</ExpandingCard>
<ExpandingCard title="Bug fixes" icon="new_releases">
  <ul class="list-disc text-base p-2 list-inside">
    <li>
      A new button has been added to Embed Mode that will open the stream in
      LiveTL Mode.
      <img
        class="py-1"
        src={ExpandLiveTL}
        alt="Expand LiveTL"
      />
    </li>
    <li>Embed Mode will no longer open with vertical chat split.</li>
    <li>Fix auto launch mode not working in Firefox.</li>
  </ul>
</ExpandingCard>
