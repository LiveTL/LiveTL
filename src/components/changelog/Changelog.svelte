<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  const d = new Date(1659837600 * 1000);
</script>

<ExpandingCard title="TLTalk!" icon="chat" expanded>
  I (Kento, developer of HyperChat, LiveTL, etc.) will be going on Kamishiro Taishi's
  "TLTalk" show! Tune in on {d.toLocaleDateString()} at {d.toLocaleTimeString()} to learn
  more about who I am, how LiveTL came to be, and what we're working on.
  <a href="https://youtu.be/m0D9hsI2wuc" target="_blank" class="underline">
    Bookmark the stream here.
  </a>
</ExpandingCard>
