<script>
  export const version = '7.0.3';
  import ExpandingCard from '../common/ExpandingCard.svelte';
</script>

<ExpandingCard title="All-new interface... again!" icon="group">
  We re-wrote the entire interface! This time, we used a smaller library that
  should make everything more lightweight. This will also enable the LiveTL
  component to be mounted in third-party sites in the future (stay tuned!).
</ExpandingCard>
<ExpandingCard title="Introducing HyperChat v2!" icon="chat">
  HyperChat has also been rewritten with the same library as LiveTL v7, making
  it lighter and even faster than before! This new update also brings features
  such as pinned messages, Super Stickers, Membership Items and Membership
  Milestone Chats into HyperChat!
</ExpandingCard>
<ExpandingCard title="New features and bug fixes" icon="new_releases">
  <ul class="list-disc text-base p-2 list-inside">
    <li>
      A new button has been added to Embed Mode that will open the stream in
      LiveTL Mode.
      <img
        class="py-1"
        src="https://cdn.discordapp.com/attachments/786713928264319026/902138793501552660/unknown.png"
        alt="Expand LiveTL"
      />
    </li>
    <li>Embed Mode will no longer open with vertical chat split.</li>
  </ul>
</ExpandingCard>
