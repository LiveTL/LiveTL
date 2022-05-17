<script>
  import { macros } from '../../js/store.js';
  import Checkbox from '../../submodules/chat/src/components/common/Checkbox.svelte';
  import TextField from '../../submodules/chat/src/components/common/TextField.svelte';
  import Button from '../../submodules/chat/src/components/common/IconButton.svelte';

  export let name;
  export let expansion;
  export let enabled;
  export let id;

  const saveValues = (newMacro) => {
    $macros = $macros.map((m, i) => (i === id ? newMacro : m));
  };

  const deleteMacro = () => {
    $macros = $macros.filter((_, i) => i !== id);
  };

  $: saveValues({ name, expansion, enabled });
</script>

<div class="flex flex-row items-center gap-2">
  <div>
    <TextField bind:value={name} placeholder="Name" dense />
  </div>
  <div>
    <TextField bind:value={expansion} placeholder="Expansion" dense />
  </div>
  <div class="flex-initial">
    <Checkbox bind:checked={enabled} />
  </div>
  <div class="flex-initial">
    <Button icon="delete" color="error" on:click={deleteMacro} />
  </div>
</div>
