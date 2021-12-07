<script lang="ts">
  import TextField from 'smelte/src/components/TextField';
  import { noop } from 'svelte/internal';

  type Rule = {
    /** Callback function to assert input value. */
    assert: (value: string) => boolean;
    /** Error message to show when assertion fails. */
    error: string;
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
  /** Show clear button. */
  export let clearable = false;

  const checkRule = (value: string) => {
    const hasError = rules.some((rule) => {
      if (rule.assert(value)) return false;
      error = rule.error;
      return true;
    });
    if (!hasError) error = false;
  };

  $: classes = 'relative text-gray-600 dark:text-gray-100 ' +
    `${dense ? 'my-1' : 'my-2'}`;
  $: inputClasses = 'px-4 rounded-t text-black dark:text-gray-100 w-full ' +
    `text-base ${dense ? 'pb-1 pt-4' : 'pb-2 pt-6'}`;

  $: checkRule(value);
</script>

<div class="{error ? 'mb-5' : ''} {$$props.class ?? ''}">
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
    append={clearable ? 'cancel' : ''}
    on:click-append={clearable ? () => (value = '') : noop}
    iconClass={clearable ? 'cursor-pointer' : ''}
  />
</div>
