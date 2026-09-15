<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Select from 'smelte/src/components/Select';
  import { getDropdownOffsetY } from '../../ts/component-utils';

  type DropdownItem = { value: string, text: string } | string;

  /** Dropdown label. */
  export let name = '';
  /** Writable store for value updates. */
  export let store: Writable<string>;
  /** Dropdown items. */
  export let items: DropdownItem[] = [];
  /** Dense variant. */
  export let dense = false;
  /** Parent div used to determine top/bottom */
  export let boundingDiv: HTMLElement | null = null;

  $: value = $store;
  $: store.set(value);

  let showList = false;
  let div: HTMLElement;
  let offsetY = '';

  const onShowListChange = async (showList: boolean) => {
    if (!showList || !boundingDiv) return;
    offsetY = await getDropdownOffsetY(div, boundingDiv);
  };

  $: onShowListChange(showList);
  const classes = 'dropdown-wrapper cursor-pointer relative';
  $: optionsClasses = 'dropdown-options absolute left-0 bg-white rounded ' +
    'shadow w-full z-20 dark:bg-dark-500 max-h-60 overflow-auto ' + offsetY;
</script>

<div bind:this={div} class={$$props.class ? $$props.class : ''}>
  <Select
    bind:value
    bind:showList
    label={name}
    {items}
    {classes}
    {dense}
    {optionsClasses}
  />
</div>
