<script lang="ts">
  import {
    showModMessage,
    showVerifiedMessage,
    languages,
    enableMchadTLs,
    enableTldexTLs
    // enableAPITLs
  } from '../../js/store.js';
  import { languageNameValues } from '../../js/constants.js';
  import BlockedUsers from './BlockedUsers.svelte';
  import Checkbox from '../common/Checkbox.svelte';
  import CheckboxStore from '../common/CheckboxStore.svelte';
  import Card from '../common/Card.svelte';
  export let div: HTMLElement;

  const validLanguages: {[key: string]: boolean} = Object.fromEntries($languages.map((language) => [language, true]));
  $: languages.set(Object.entries(validLanguages).filter((lang) => lang[1]).map((lang) => lang[0]));
</script>

<Card title="Filter Languages" icon="filter_alt" noGap>
  {#each languageNameValues as language}
    <Checkbox label={language.text} bind:checked={validLanguages[language.value]} />
  {/each}
</Card>
<Card title="Filter Options" icon="settings" noGap>
  <CheckboxStore name="Show moderator and owner messages" store={showModMessage} />
  <CheckboxStore name="Show verified user messages" store={showVerifiedMessage} />
</Card>
<BlockedUsers boundingDiv={div} />
<Card title="External translation sources" icon="cloud" noGap>
  <!-- <Checkbox name="LiveTL API" store={enableAPITLs} /> -->
  <CheckboxStore name="MChad (volunteer translators)" store={enableMchadTLs} />
  <CheckboxStore name="TLdex" store={enableTldexTLs} />
</Card>
<slot name="extras" />
