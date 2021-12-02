<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import LayoutPresets from './assets/LayoutPresets.png';
</script>

<ExpandingCard title="One-Year Anniversary!" icon="event_repeat" expanded>
  December 2nd marks the one-year anniversary of LiveTL 🎉
  <br />
  <br />
  Read the entire story of how LiveTL started, where we've been, and where we are
  now:
  <a
    href="https://www.reddit.com/r/Hololive/comments/r7btmn/oneyear_anniversary_appreciation_post_see_comments/"
    target="_blank"
    class="text-blue-400 underline">View Post</a
  >
</ExpandingCard>
<ExpandingCard title="Layout presets" icon="windows">
  You can now save layout preferences as "presets" in the settings menu! With
  just a few clicks, you can jump between your favorite UI layout
  configurations.
  <img class="pt-2" src={LayoutPresets} alt="LiveTL Layout Presets" />
</ExpandingCard>
