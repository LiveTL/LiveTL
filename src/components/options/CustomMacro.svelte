<script>
  import { mdiDelete } from '@mdi/js';
  import { macros } from '../../js/store.js';
  import Checkbox from '../common/Checkbox.svelte';
  import SvgButton from '../../submodules/chat/src/components/common/SvgButton.svelte';
  import TextField from '../common/TextField.svelte';

  export let name;
  export let expansion;
  export let enabled;
  export let id;

  const saveValues = newMacro => {
    $macros = $macros.map((m, i) => i === id ? newMacro : m);
  };

  const deleteMacro = () => {
    $macros = $macros.filter((_, i) => i !== id);
  };

  $: saveValues({ name, expansion, enabled });
</script>

<div class="flex flex-row items-center gap-2 my-2">
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
    <SvgButton
      path={mdiDelete}
      transparent
      xPadding='1'
      yPadding='0'
      color='error'
      on:click={deleteMacro}
      size='24px'
    />
  </div>
</div>
