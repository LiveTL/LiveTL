<script>
  import SmelteButton from 'smelte/src/components/Button';

  export let value = false;
  export let outlined = false;
  export let text = false;
  export let block = false;
  export let disabled = false;
  export let icon = null;
  export let small = false;
  export let light = false;
  export let dark = false;
  export let flat = false;
  export let iconClass = '';
  export let color = 'primary';
  export let href = null;
  export let fab = false;
  export let type = 'button';
  export let remove = '';
  export let add = '';
  export let replace = {};
  export let classes = 'z-10 py-2 px-4 uppercase text-sm font-medium relative overflow-hidden';
  export let basicClasses = 'text-white duration-200 ease-in';
  export let outlinedClasses = 'bg-transparent border border-solid';
  export let textClasses = 'bg-transparent border-none px-4 hover:bg-transparent';
  export let iconClasses = 'p-4 flex items-center select-none';
  export let fabClasses = 'hover:bg-transparent';
  export let smallClasses = 'pt-1 pb-1 pl-2 pr-2 text-xs';
  export let disabledClasses =
    'bg-gray-300 text-gray-500 dark:bg-dark-400 pointer-events-none hover:bg-gray-300 cursor-default';
  export let elevationClasses = 'hover:shadow shadow';
</script>

<SmelteButton
  bind:value
  {outlined}
  {text}
  {block}
  {disabled}
  {icon}
  {small}
  {light}
  {dark}
  {flat}
  {iconClass}
  {color}
  {href}
  {fab}
  {type}
  {remove}
  {add}
  {replace}
  {classes}
  {basicClasses}
  {outlinedClasses}
  {textClasses}
  {iconClasses}
  {fabClasses}
  {smallClasses}
  {disabledClasses}
  {elevationClasses}
  {...$$restProps}
  on:click
  on:mouseover
>
  <slot />
</SmelteButton>
