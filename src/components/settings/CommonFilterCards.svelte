<script lang="ts">
  import {
    showModMessage,
    showVerifiedMessage,
    languages,
    enableMchadTLs
    // enableAPITLs
  } from '../../js/store.js';
  import { languageNameValues } from '../../js/constants.js';
  import BlockedUsers from './BlockedUsers.svelte';
  import Checkbox from '../common/Checkbox.svelte';
  import CheckboxStore from '../common/CheckboxStore.svelte';
  import Card from '../common/Card.svelte';
  export let div: HTMLElement;

  let validLanguages: {[key: string]: boolean} = Object.fromEntries($languages.map((language) => [language, true]));
  $: languages.set(Object.entries(validLanguages).filter((lang) => lang[1]).map((lang) => lang[0]));
</script>

<Card title="Filters" icon="filter_alt" noGap>
  <!-- <Dropdown
    name="Language filter"
    store={language}
    items={languageNameValues}
    boundingDiv={div}
  /> -->
  {#each languageNameValues as language}
    <Checkbox label={language.text} bind:checked={validLanguages[language.value]} />
  {/each}
  <div class="mt-6">
    <CheckboxStore name="Show moderator and owner messages" store={showModMessage} />
    <CheckboxStore name="Show verified user messages" store={showVerifiedMessage} />
  </div>
</Card>
<BlockedUsers boundingDiv={div} />
<Card title="External translation sources" icon="cloud" noGap>
  <!-- <Checkbox name="LiveTL API" store={enableAPITLs} /> -->
  <CheckboxStore name="MChad (volunteer translators)" store={enableMchadTLs} />
</Card>
<slot name="extras" />
