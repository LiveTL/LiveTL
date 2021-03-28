<script>
  import {
    showModMessage,
    language,
    textFilters,
    usernameFilters,
    channelFilters,
  } from "../../js/store.js";
  import { languageNameValues } from "../../js/constants.js";
  import CheckOption from "../options/Toggle.svelte";
  import ListEdit from "../options/ListEdit.svelte";
  import SelectOption from "../options/Dropdown.svelte";
  export let isStandalone = false;
</script>

<SelectOption
  name="Language Filter"
  store={language}
  items={languageNameValues}
/>
<CheckOption name="Show moderator messages" store={showModMessage} />
<ListEdit name="Regex filters" store={textFilters}/>
