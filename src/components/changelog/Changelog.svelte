<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import twitch from './twitch.png';
</script>

<ExpandingCard title="Twitch Support!" icon="live_tv" expanded>
  LiveTL now works on Twitch! You can filter chat messages, view MChad TLs, and
  more, just like on YouTube.
  <img class="pt-2" src={twitch} alt="LiveTL on Twitch" />
</ExpandingCard>
