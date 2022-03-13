<script>
  import ExpandingCard from '../common/ExpandingCard.svelte';
</script>

<ExpandingCard title="New HyperChat features!" icon="chat" expanded>
  <ul class="list-disc list-inside">
    <strong>On today's KFP menu:</strong>
    <li class="ml-3.5">
      Show only messages from channel members
    </li>
    <li class="ml-3.5">
      Hide emoji-only spam messages or hide all emotes
    </li>
  </ul>
  <ul class="list-disc list-inside">
    <strong>What's cooking in the usual room:</strong>
    <li class="ml-3.5">
      Fixing message translation language selection
    </li>
    <li class="ml-3.5">
      Reducing live chat message delays
    </li>
    <li class="ml-3.5">
      Fixing colored emoji rendering issues
    </li>
  </ul>
</ExpandingCard>

