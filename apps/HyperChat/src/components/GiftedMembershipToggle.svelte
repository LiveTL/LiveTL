<script lang="ts">
  import { mdiCogOutline } from '@mdi/js';
  import { toggleMembershipGifting } from '../ts/chat-actions';
  import { isYtFrame } from '../ts/chat-constants';
  import { port } from '../ts/storage';
</script>

{#if isYtFrame}
  <button
    type="button"
    class="rounded-full flex justify-center items-center w-8 h-8"
    title="Membership gifting settings"
    aria-label="Membership gifting settings"
    on:click={() => toggleMembershipGifting($port)}
  >
    <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden="true">
      <path d={mdiCogOutline} fill="currentColor" />
    </svg>
  </button>
{/if}
