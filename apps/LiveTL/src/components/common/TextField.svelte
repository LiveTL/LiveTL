<script lang="ts">
  const noop = (): void => {};

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
  /** Clear button function. */
  export let clearableFn: (() => any) = () => (value = '');

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
  <label class={classes}>
    {#if label}<span class="absolute left-4 top-1 text-xs">{label}</span>{/if}
    {#if textarea}
      <textarea bind:value {placeholder} class="{inputClasses} {outlined ? 'border' : ''} {add}" />
    {:else}
      <input bind:value {placeholder} class="{inputClasses} {outlined ? 'border' : ''} {add}" />
    {/if}
    {#if clearable && value}<button type="button" class="absolute right-2 top-2 material-icons" on:click={clearable ? clearableFn : noop}>cancel</button>{/if}
    {#if error}<span class="absolute left-0 top-full text-error-500 text-xs">{error}</span>{/if}
  </label>
</div>
