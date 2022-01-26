<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import twitch from './twitch.png';
</script>

<ExpandingCard title="Twitch Support!" icon="live_tv">
  LiveTL now works on Twitch! You can filter chat messages, view MChad TLs, and
  more, just like on YouTube.
  <img class="pt-2" src={twitch} alt="LiveTL on Twitch" />
</ExpandingCard>
<ExpandingCard title="HyperChat Settings Panel" icon="chat">
  HyperChat's standalone settings menu is finally here! You can now easily toggle
  options like profile pictures, timestamps, usernames, badges, and color themes
  (inspired by Kiwawa having trouble with turning on dark mode).
</ExpandingCard>
<ExpandingCard title="Multi-Language Translation Filters" icon="translate">
  LiveTL now supports multiple languages! You can now filter messages in multiple
  languages at once. As a side benefit, you can now disable translation filtering
  entirely as well!
</ExpandingCard>
<ExpandingCard title="Internal Fixes" icon="bug_report">
  v8.0.3 had a few minor issues, those should be resolved in v8.0.4!
</ExpandingCard>
