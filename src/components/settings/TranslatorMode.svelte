<script>
  import { onMount } from 'svelte';
  import CustomMacro from '../options/CustomMacro.svelte';
  import { macros, doAutoPrefix, doTranslatorMode, autoPrefixTag, macroTrigger } from '../../js/store.js';
  import { isAndroid } from '../../js/constants.js';
  import Checkbox from '../../submodules/chat/src/components/common/CheckboxStore.svelte';
  import TextField from '../../submodules/chat/src/components/common/TextField.svelte';
  import Card from '../../submodules/chat/src/components/common/Card.svelte';
  import ExpandingCard from '../../submodules/chat/src/components/common/ExpandingCard.svelte';
  import Icon from '../../submodules/chat/src/components/common/Icon.svelte';

  const leaderCharRules = [
    {
      assert: (value) => value.length === 1,
      error: 'Please input a single character'
    }
  ];

  const emptyMacro = { name: '', expansion: '', enabled: true };

  const cleanUpMacros =
    () => ($macros = $macros.filter(m => m.name + m.expansion));

  const createNewMacro = () => ($macros = [...cleanUpMacros(), emptyMacro]);

  $: macroLeader = $macroTrigger;
  $: if (leaderCharRules[0].assert(macroLeader)) {
    macroTrigger.set(macroLeader);
  }

  onMount(() => setTimeout(cleanUpMacros));
</script>

<Card title="Translator mode" icon="translate">
  <Checkbox name="Enable translator mode" store={doTranslatorMode} disabled={isAndroid} />
  {#if $doTranslatorMode}
    <Checkbox name="Auto-prefix chat messages" store={doAutoPrefix} />
    {#if $doAutoPrefix}
      <TextField
        bind:value={$autoPrefixTag}
        label="Tag to prepend"
      />
    {/if}
    <Card
      title="Macros"
      icon="text_snippet"
      headerEndIcon="add"
      headerEndIconOnClick={createNewMacro}
      nested={true}
    >
      <TextField
        rules={leaderCharRules}
        bind:value={macroLeader}
        label="Macro trigger character"
      />
      {#each $macros as macro, id}
        <CustomMacro {...macro} {id} />
      {/each}
    </Card>
    <ExpandingCard title="How to use macros" icon="info" nested={true}>
      <div class="text-base p-2 flex flex-col gap-4">
        <p>
          Macros are identified by a name and will expand to the expansion
          when typed.
        </p>
        <p>To add a macro, press the + icon next to "Macros".</p>
        <p>
          To use macros, type the macro trigger string in chat and start
          typing in the name of a macro. (ex. /mymacro)
        </p>
        <p>
          Suggestions will appear under the chat entry box which can be cycled
          through with the tab key.
        </p>
        <p>
          When you have your macro suggestion highlighted, hit space and the
          macro will expand.
        </p>
      </div>
    </ExpandingCard>
  {/if}
</Card>

{#if isAndroid}
  <p>
    <Icon>info</Icon>
    Some features are only supported on the desktop LiveTL extension. Get LiveTL
    on Chrome, Firefox, etc. to use these features!
  </p>
{/if}
