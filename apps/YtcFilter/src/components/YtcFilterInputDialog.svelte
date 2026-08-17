<script lang="ts">
  import { dataTheme, inputDialog, isDark } from '../ts/storage';
  import { exioDialog, exioButton, exioTextbox } from 'exio/svelte';
  import '../stylesheets/ui.css';
  import { onDestroy } from 'svelte';
  let title = '';
  $: title = $inputDialog?.title ?? title;
  let action = {
    text: '',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callback: (s: string[]) => {},
    cancelled: () => {}
  } as any;
  $: action = {
    ...($inputDialog?.action ?? action),
    cancelled: $inputDialog?.action.cancelled ?? (() => {})
  };
  let values: string[] = [];
  const setValue = (v?: string[]) => {
    if (v) {
      values = v;
      document.querySelectorAll('.prompt-input').forEach((e, i) => {
        (e as HTMLInputElement).value = values[i];
      });
    }
  };
  $: setValue($inputDialog?.prompts.map(p => p.originalValue));
  interface PromptType {
    originalValue: string;
    label: string;
    hideLabel?: boolean;
    large?: boolean;
  }
  let prompts: PromptType[] = [];
  $: prompts = $inputDialog?.prompts ?? prompts;
  let message = '';
  $: message = $inputDialog?.component ? '' : ($inputDialog?.message ?? message);
  let component: any = null;
  $: component = $inputDialog?.message ? null : ($inputDialog?.component ?? component);
  let open = false;
  $: toOpen = Boolean($inputDialog);
  let wrapperElem: HTMLDialogElement | null = null;
  $: {
    open = false;
    setTimeout(() => {
      open = toOpen;
      if (toOpen) {
        if (!$inputDialog?.component) {
          component = null;
        }
      } else {
        setTimeout(() => {
          component = null;
        }, 400);
      }
    }, 0);
  }
  // const focusInput = () => {
  //   inputItem?.focus();
  //   inputItem?.select();
  // };
  let inputItem: HTMLInputElement | HTMLTextAreaElement | null = null;
  const zip = (prompts: PromptType[], values: string[]) => {
    return prompts.map((p, i) => {
      return {
        ...p,
        value: values[i]
      };
    });
  };
  const editCallback = ((index: number) => {
    return (e: InputEvent) => {
      values = values.map((v, i) => {
        if (i === index) return (e.target as HTMLInputElement).value;
        return v;
      });
    };
  }) as any;
  onDestroy(() => {
    $inputDialog = null;
  });
</script>

<svelte:window 
  on:keydown={e => {
    if (e.key === 'Escape') {
      action.cancelled();
      $inputDialog = null;
    }
  }}
/>

<dialog
  data-theme={$dataTheme}
  use:exioDialog={{
    backgroundColor: $isDark ? 'black' : 'white'
  }}
  {open}
  style="font-size: 1rem; min-width: min(350px, calc(100% - 40px));"
  class:reactive-width={Boolean(component)}
  bind:this={wrapperElem}
>
  <div class="big-text select-none">{title}</div>
  <p class="select-none">
    {#if message}
      <span class="select-none">{message}</span>
      <br />
    {/if}
    {#each zip(prompts, values) as item, index}
      {#if item.label && (!('hideLabel' in item) || !item.hideLabel)}
        <span class="select-none"><strong>{item.label}</strong></span>
      {/if}
      {#if item.large}
        <div>
          <textarea
            value={item.originalValue}
            use:exioTextbox
            style="overflow: auto; width: min(calc(100vw - 2rem), 400px); height: 4em; box-sizing: border-box; {prompts.length <= 1 ? 'margin-top' : 'margin-bottom'}: 10px;"
            on:input={editCallback(index)}
            placeholder={item.label}
            bind:this={inputItem}
            class="prompt-input"
        />
      </div>
      {:else}
        <input
          type="text"
          value={item.originalValue}
          use:exioTextbox
          style="width: 100%; {prompts.length <= 1 ? 'margin-top' : 'margin-bottom'}: {message ? 10 : 0}px;"
          on:keydown={e => {
            if (e.key === 'Enter') {
              action.callback(values);
              $inputDialog = null;
            } else if (e.key === 'Escape') {
              action.cancelled();
              $inputDialog = null;
            }
          }}
          on:input={editCallback(index)}
          placeholder={item.label}
          bind:this={inputItem}
          class="prompt-input"
        />
      {/if}
    {/each}
    {#if component}
      <svelte:component this={component} />
    {/if}
  </p>
  {#if !('noAction' in action && action.noAction)}
    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button on:click={() => {
        $inputDialog = null;
        action.cancelled();
      }} use:exioButton>Cancel</button>
      <button
        on:click={() => {
          action.callback(values);
          $inputDialog = null;
        }}
        use:exioButton
        class="blue-bg"
      >{action.text}</button>
    </div>
  {/if}
</dialog>

<style>
  [data-theme='light'] input {
    background-color: rgb(230, 230, 230);
  }
  [data-theme='light'] textarea {
    background-color: rgb(230, 230, 230);
  }
  textarea {
    background-color: #191919;;
  }
  .reactive-width {
    width: min(450px, calc(100% - 40px));
  }
</style>
