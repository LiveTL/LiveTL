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
  import { Subheader /*, List, ListItem, ExpansionPanels, ExpansionPanel */ } from 'svelte-materialify/src';
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

  const getMidPrompt = chatAuthor => chatAuthor == 'chat' ? 'messages containing' : 'authors named';
  const getEndPrompt = plainReg => plainReg == 'plain' ? '' : '(regex)';
  const getPrompt = (whiteBlack, chatAuthor, plainReg, contains = '...') => {
    return `${whiteBlack} ${getMidPrompt(chatAuthor)}${contains} ${getEndPrompt(plainReg)}`;
  };

  function getRules() {
    const rules = [];
    ['Show', 'Block'].forEach(beg => {
      ['plain', 'regex'].forEach(mid => {
        ['chat', 'author'].forEach(end => {
          const store = paths[beg][mid][end];
          store.get().forEach(e => {
            rules.push(getPrompt(beg, mid, end, ' ' + e));
          });
        });
      });
    });
    return rules;
  }

  $: rawStores = [
    $plaintextWhitelist,
    $plainAuthorWhitelist,
    $textWhitelist,
    $regexAuthorWhitelist,
    $plaintextBlacklist,
    $plainAuthorBlacklist,
    $textBlacklist,
    $regexAuthorBlacklist
  ];

  $: rules = [rawStores, getRules()][1];
  $: filterPrompt = getPrompt($whiteBlackList, $chatAuthor, $plaintextRegex);
  $: filterStore = paths[$whiteBlackList][$plaintextRegex][$chatAuthor];
</script>

<SelectOption
  name="Language filter"
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
  <!--
  <ExpansionPanels>
    <ExpansionPanel>
      <span slot="header">Custom filters</span>
      <List>
        {#each rules as rule}
          <ListItem>{rule}</ListItem>
        {/each}
      </List>
    </ExpansionPanel>
  </ExpansionPanels>
  -->
  <Subheader>Custom filter options</Subheader>
  <EnumOption name="" options={['chat', 'author']} store={chatAuthor} />
  <EnumOption name="" options={['Show', 'Block']} store={whiteBlackList} />
  <EnumOption name="" options={['plain', 'regex']} store={plaintextRegex} />

  <ListEdit name={filterPrompt} store={filterStore} />
</div>
