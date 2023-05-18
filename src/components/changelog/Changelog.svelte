<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import HCChangelogs from '../../submodules/chat/src/components/changelog/Changelog.svelte';
  // const trailer = chrome.runtime.getURL(
  //   'hyperchat/trailer.png'
  // );
</script>

<ExpandingCard title="Internal Improvements" icon="chat">
  <HCChangelogs />
</ExpandingCard>

<!-- <ExpandingCard title="Twitch and TLdex Fixes" icon="chat" expanded> -->
  <!-- <div style="width: 100%; display: flex; justify-content: center; margin: 8px 0px;">
    <a href="https://www.youtube.com/watch?v=FU3YWQy_Rfs" target="_blank">
      <img src={trailer} style="width: 100%; aspect-ratio: calc(16 / 9);" alt="HyperChat Trailer" class="rounded-sm" />
    </a>
  </div> -->
  <!-- Due to changes to YouTube and Twitch, some users were experiencing
  issues with Twitch and TLdex. These issues have been fixed. 
</ExpandingCard> -->
