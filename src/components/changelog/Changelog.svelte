<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import HCChangelogs from '../../submodules/chat/src/components/changelog/Changelog.svelte';
</script>

<ExpandingCard title="TLdex Improvements" icon="chat">
  LiveTL will no longer mark chat messages delivered through TLdex
  with the TLdex badge. The badge will be reserved for translators
  who use the TLdex translation client.
</ExpandingCard>
<ExpandingCard title="Spam Protection Improvements" icon="chat">
  Previously, LiveTL accidentally marked avid translators such as
  <a href="https://twitter.com/kamishirotaishi" target="_blank" class="text-blue-400 underline">
    Kamishiro Taishi
  </a>
  as spammers because they sent more than 5 messages within 10 seconds.
  To prevent accidental blocks, there is now a confirmation dialog when a spammer is detected.
  We are also internally overhauling the user block/whitelist mechanism -- those improvements
  will be included in a future update!
</ExpandingCard>
<ExpandingCard title="New HyperChat Features!" icon="chat">
  <HCChangelogs />
</ExpandingCard>
