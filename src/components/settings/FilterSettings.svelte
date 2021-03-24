<script>
  import {
    showModMessage,
    language,
    usernameFilters,
    channelFilters,
  } from "../../js/store.js";
  import { languageNameValues } from "../../js/constants.js";
  import CheckOption from "../options/Toggle.svelte";
  import SliderOption from "../options/Slider.svelte";
  import EnumOption from "../options/Radio.svelte";
  import SelectOption from "../options/Dropdown.svelte";
  export let isStandalone = false;
</script>

<SelectOption
  name="Language Filter"
  store={language}
  items={languageNameValues}
/>
<CheckOption name="Show moderator messages" store={showModMessage} />
