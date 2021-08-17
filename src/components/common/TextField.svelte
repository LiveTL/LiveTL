<script lang="ts">
  import { TextField } from 'smelte';

  type Rule = {
    /** Callback function to assert input value. */
    assert: (value: string) => boolean,
    /** Error message to show when assertion fails. */
    error: string
  };

  /** Input value. */
  export let value = '';
  /** Input label. */
  export let label = '';
  /** Input placeholder. */
  export let placeholder = '';
  /** Dense variant. */
  export let dense = false;
  /** Outlined variant. */
  export let outlined = false;
  /** Textarea instead of normal input. */
  export let textarea = false;
  /** Classes to add to the TextField. */
  export let add = '';
  /** If string, an error message will be shown. */
  export let error: string | false = false;
  /** Rules to assert input value. */
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
