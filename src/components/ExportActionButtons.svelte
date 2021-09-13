<script>
  import Tooltip from '../submodules/chat/src/components/common/Tooltip.svelte';
  import Button from './common/IconButton.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="flex-shrink-0">
  <Tooltip>
    <Button
      slot="activator"
      icon="select_all"
      color="blue"
      on:click={() => dispatch('selectAllItems')}
      filled
    />
    <span>Select all</span>
  </Tooltip>
</div>
<div class="flex-shrink-0">
  <Tooltip>
    <Button
      slot="activator"
      icon="check"
      color="success"
      on:click={() => dispatch('run')}
      filled
    />
    <span>Export</span>
  </Tooltip>
</div>
<div class="flex-shrink-0">
  <Tooltip>
    <Button
      slot="activator"
      icon="close"
      color="error"
      on:click={() => dispatch('cancel')}
      filled
    />
    <span>Close</span>
  </Tooltip>
</div>
