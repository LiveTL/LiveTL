<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
  import HCChangelogs from '../../submodules/chat/src/components/changelog/Changelog.svelte';
</script>

<ExpandingCard title="Fixes for read-aloud mode" icon="record_voice_over">
  The read-aloud mode occasionally read messages twice. The issue has been fixed!
</ExpandingCard>
<ExpandingCard title="HyperChat Fixes and Improvements" icon="chat">
  <HCChangelogs />
</ExpandingCard>
