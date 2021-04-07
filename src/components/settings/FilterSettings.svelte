<script>
  import {
    showModMessage,
    language,
    textWhitelist,
    textBlacklist,
    usernameFilters,
    channelFilters,
  } from "../../js/store.js";
  import { languageNameValues } from "../../js/constants.js";
  import CheckOption from "../options/Toggle.svelte";
  import ListEdit from "../options/ListEdit.svelte";
  import SelectOption from "../options/Dropdown.svelte";
  import MultiDropdown from "../options/MultiDropdown.svelte";
  export let isStandalone = false;
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
  setBool={(n, v) => channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}/>
<ListEdit name="Chat whitelist (regex)" store={textWhitelist}/>
<ListEdit name="Chat blacklist (regex)" store={textBlacklist} />
