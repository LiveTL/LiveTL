<script lang="ts">
  import { exioRadio } from 'exio/svelte';
  import { getRandomString } from '../../ts/chat-utils';
  export let value: string;
  export let name = getRandomString();
  export let options: Array<{
    value: string;
    label: string;
  }>;
  const update = (e: any) => {
    if ((e.target as HTMLInputElement).checked) {
      value = (e.target as HTMLInputElement).value;
    }
  };
</script>

{#each options as option}
  <div class="aligned-radios">
    <div class="export-radio">
      <input
        type="radio"
        name={name}
        id={`${name}-${option.value}`}
        value={option.value}
        use:exioRadio
        group={name}
        checked={option.value === value}
        on:change={update}
      />
    </div>
    <label for={`${name}-${option.value}`}>{option.label}</label>
  </div>
{/each}

<style>
  .aligned-radios {
    display: flex;
    align-items: center;
  }
  .export-radio {
    margin-right: 0.5rem;
  }
</style>
