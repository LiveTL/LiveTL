<script lang="ts">
  import { TextField } from 'smelte';

  type Rule = {
    assert: (value: string) => boolean,
    error: string
  };

  export let value = '';
  export let label = '';
  export let placeholder = '';
  export let dense = false;
  export let outlined = false;
  export let textarea = false;
  export let add = '';
  export let error: string | false = false;
  export let rules: Rule[] = [];

  const checkRule = (value: string) => {
    const hasError = rules.some((rule) => {
      if (rule.assert(value)) return false;
      error = rule.error;
      return true;
    });
    if (!hasError) error = false;
  };

  $: my = dense ? '1' : '2';
  $: inputPb = dense ? '1' : '2';
  $: inputPt = dense ? '4' : '6';

  $: classes = `my-${my} relative text-gray-600 dark:text-gray-100`;
  $: inputClasses = `pb-${inputPb} pt-${inputPt} px-4 rounded-t text-black dark:text-gray-100 w-full`;

  $: checkRule(value);
</script>

<TextField
  bind:value
  {label}
  {placeholder}
  {classes}
  {inputClasses}
  {outlined}
  {textarea}
  {add}
  {error}
/>
