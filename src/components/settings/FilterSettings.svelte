<script>
  import { writable } from 'svelte/store';
  import {
    showModMessage,
    language,
    textWhitelist,
    textBlacklist,
    plaintextWhitelist,
    plaintextBlacklist,
    plainAuthorWhitelist,
    regexAuthorWhitelist,
    plainAuthorBlacklist,
    regexAuthorBlacklist,
    channelFilters
  } from '../../js/store.js';
  import { Subheader } from 'svelte-materialify/src';
  import { languageNameValues } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import EnumOption from '../options/FilterSelector.svelte';
  import ListEdit from '../options/ListEdit.svelte';
  import SelectOption from '../options/Dropdown.svelte';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  export let isStandalone = false;

  const whiteBlackList = writable('Show');
  const plaintextRegex = writable('plain');
  const chatAuthor = writable('chat');
  const paths = {
    Show: {
      plain: {
        chat: plaintextWhitelist,
        author: plainAuthorWhitelist
      },
      regex: {
        chat: textWhitelist,
        author: regexAuthorWhitelist
      }
    },
    Block: {
      plain: {
        chat: plaintextBlacklist,
        author: plainAuthorBlacklist
      },
      regex: {
        chat: textBlacklist,
        author: regexAuthorBlacklist
      }
    }
  };

  $: middlePrompt =
    $chatAuthor == 'chat' ? 'messages containing' : 'authors named';
  $: endPrompt = $plaintextRegex == 'plain' ? 'plaintext' : 'regex';
  $: filterPrompt = `${$whiteBlackList} ${middlePrompt}...(${endPrompt})`;
  $: filterStore = paths[$whiteBlackList][$plaintextRegex][$chatAuthor];
</script>

<SelectOption
  name="Language Filter"
  store={language}
  items={languageNameValues}
/>
<CheckOption name="Show moderator messages" store={showModMessage} />
<MultiDropdown
  name="Blocked users"
  store={channelFilters}
  getDisplayName={(n, v) => v.name}
  getBool={n => channelFilters.get(n).blacklist}
  setBool={(n, v) =>
    channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
/>
<div class="filter-options">
  <Subheader>Custom filter options</Subheader>
  <EnumOption name="" options={['chat', 'author']} store={chatAuthor} />
  <EnumOption name="" options={['Show', 'Block']} store={whiteBlackList} />
  <EnumOption name="" options={['plain', 'regex']} store={plaintextRegex} />

  <ListEdit name={filterPrompt} store={filterStore} />
</div>
