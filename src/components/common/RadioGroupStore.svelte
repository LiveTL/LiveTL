<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { RadioButtonGroup, RadioButton } from 'smelte/src/components/RadioButton';

  type RadioItem = { value: string | boolean, label: string };

  /** Writable store for value updates. */
  export let store: Writable<string | boolean>;
  /** Radio button group items. */
  export let items: RadioItem[] = [];
  /** Map to generate items with. Will overwrite `items` prop. */
  export let map: Map<string | boolean, string> | null = null;
  /** Vertical variant. */
  export let vertical = false;

  const mapToRadioItem = (map: Map<string | boolean, string>) => {
    const items = [];
    for (const [key, value] of map) {
      items.push({ value: key, label: value });
    }
    return items;
  };

  $: if (map) {
    items = mapToRadioItem(map);
  }
  $: selected = $store as string;
  $: store.set(selected);

  const classes = `flex ${vertical ? 'flex-col' : 'gap-3 flex-wrap'}`;
  const buttonClasses = 'inline-flex block items-center cursor-pointer z-0';
</script>

<RadioButtonGroup
  {classes}
  bind:selected
  {buttonClasses}
  {items}
  let:item
>
  <RadioButton
    bind:selected
    classes={buttonClasses}
    {...item}
  />
</RadioButtonGroup>
