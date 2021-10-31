<script>
  import Select from 'smelte/src/components/Select';
  import Icon from '../common/Icon.svelte';
  import { getDropdownOffsetY, getRelativeRect } from '../../ts/component-utils';
  // I legit can't understand LookupStore to migrate this to TS lol

  export let name = '';
  export let store = null; // LookupStore
  export let getDisplayName = (key, value) => `${key}` || value;
  export let getBool = (key) => store.get(key);
  export let setBool = (key, val) => store.set(key, val);
  export let boundingDiv = null;
  export let width = 0;

  let showList = false;
  let div = null;
  let offsetY = '';
  let offsetX = '';

  function convertLookup(lookup) {
    return [...lookup]
      .filter(([key]) => key && getBool(key))
      .map(([key, value]) => ({ key, item: getDisplayName(key, value) }));
  }

  const onShowListChange = async (showList) => {
    if (!showList) return;
    offsetY = await getDropdownOffsetY(div, boundingDiv);

    const relativeRect = getRelativeRect(div, boundingDiv);
    if (relativeRect.left + width > boundingDiv.clientWidth) {
      offsetX = 'right-0';
    } else {
      offsetX = 'left-0';
    }
  };

  $: items = convertLookup($store);
  $: onShowListChange(showList);
  const classes = 'dropdown-wrapper cursor-pointer relative';
  $: optionsClasses = 'dropdown-options divide-y divide-gray-600 absolute ' +
    'bg-white dark:bg-dark-500 rounded shadow z-20 max-h-60 overflow-auto ' +
    `${offsetY} ${offsetX}`;
</script>

<div bind:this={div} class={$$props.class ? $$props.class : ''}>
  <Select
    label={name}
    dense
    bind:showList
    {classes}
  >
    <div
      slot="options"
      class={optionsClasses}
      on:click|stopPropagation
      style="width: {width}px;"
    >
      {#if items.length}
        {#each items as item}
          <div class="flex flex-row py-4 px-2 items-center cursor-default gap-2">
            <div class="flex-1">{item.item}</div>
            <Icon
              class="flex-none cursor-pointer"
              on:click={() => setBool(item.key, false)}
            >
              cancel
            </Icon>
          </div>
        {/each}
      {:else}
        <div class="py-4 px-2 cursor-default">None</div>
      {/if}
    </div>
  </Select>
</div>
