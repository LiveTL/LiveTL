<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  // import HCChangelogs from '../../submodules/chat/src/components/changelog/Changelog.svelte';
</script>

<ExpandingCard title="TLdex Integration + TLdex Fixes" icon="chat">
  In addition to the YouTube chat, LiveTL now hooks into TLdex (Holodex) to provide
  translations more quickly and more reliably! TLdex fully replaces all MChad functionality
  as the service has been taken offline. Thank you to the Holodex team for making this possible,
  and we wish MonMon Mnemonics (MChad dev) the best of luck with his PhD! o7
  <br /><br />
  <strong>v8.2.10:</strong> There were some issues with TLdex in the initial release. This release
  fixes TLdex integration for livestreams!
</ExpandingCard>
<ExpandingCard title="Translation Export Fixes" icon="chat">
  Previously, there were visual bugs when exporting translations as a screenshot or text file.
  Additionally, there was a 1-pixel white line at the bottom of all screenshots. These issues have been fixed!
</ExpandingCard>

