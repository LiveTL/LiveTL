<script lang="ts">
  import {
    showModMessage,
    showVerifiedMessage,
    language,
    enableMchadTLs,
    enableAPITLs
  } from '../../js/store.js';
  import { languageNameValues } from '../../js/constants.js';
  import BlockedUsers from './BlockedUsers.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Dropdown from '../common/DropdownStore.svelte';
  import Card from '../common/Card.svelte';
  export let div: HTMLElement;
</script>

<Card title="Filters" icon="filter_alt" noGap>
  <Dropdown
    name="Language filter"
    store={language}
    items={languageNameValues}
    boundingDiv={div}
  />
  <div class="mt-6">
    <Checkbox name="Show moderator and owner messages" store={showModMessage} />
    <Checkbox name="Show verified user messages" store={showVerifiedMessage} />
  </div>
</Card>
<BlockedUsers boundingDiv={div} />
<Card title="External translation sources" icon="cloud" noGap>
  <Checkbox name="LiveTL API" store={enableAPITLs} />
  <Checkbox name="MChad (volunteer translators)" store={enableMchadTLs} />
</Card>
<slot name="extras" />
