<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import HCChangelogs from '../../submodules/chat/src/components/changelog/Changelog.svelte';
</script>

<ExpandingCard title="Manifest v3 Update" icon="extension">
  After two years of struggles, the LiveTL Manifest v3 upgrade
  is now live for Chromium-based browsers! This update ensures
  that the extension will prevail through Google's scheduled purge
  of older extensions based on Manifest v2.
</ExpandingCard>

<ExpandingCard title="HyperChat v3 Update" icon="chat">
  <HCChangelogs />
</ExpandingCard>
