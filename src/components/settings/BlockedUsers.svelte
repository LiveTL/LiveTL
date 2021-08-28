<script>
  import { channelFilters, enableMchadTLs, mchadUsers } from '../../js/store.js';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  import Card from '../common/Card.svelte';

  export let boundingDiv;
</script>

<Card title="Blocked Users" icon="block">
  <div class="flex gap-2 flex-wrap">
    <div class="flex-1">
      <MultiDropdown
        name="YouTube chat"
        store={channelFilters}
        getDisplayName={(n, v) => v.name}
        getBool={n => channelFilters.get(n).blacklist}
        setBool={(n, v) =>
          channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
        {boundingDiv}
      />
    </div>
    {#if $enableMchadTLs}
      <div class="flex-1">
        <MultiDropdown
          name="MChad"
          store={mchadUsers}
          {boundingDiv}
        />
      </div>
    {/if}
  </div>
</Card>
