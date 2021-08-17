<script>
  import { Row, Icon, ExpansionPanels, ExpansionPanel } from 'svelte-materialify/src';
  import { mdiInformation, mdiPlus } from '@mdi/js';
  import { onMount } from 'svelte';

  import CustomMacro from '../options/CustomMacro.svelte';
  import { macros, doAutoPrefix, doTranslatorMode, autoPrefixTag, macroTrigger } from '../../js/store.js';
  import { isAndroid } from '../../js/constants.js';
  import Checkbox from '../common/CheckboxStore.svelte';
  import TextField from '../common/TextField.svelte';
  import SvgButton from '../../submodules/chat/src/components/common/SvgButton.svelte';

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

<Checkbox name="Translator mode" store={doTranslatorMode} disabled={isAndroid} />
{#if $doTranslatorMode}
  <Checkbox name="Auto-prefix chat messages" store={doAutoPrefix} />
  {#if $doAutoPrefix}
    <TextField
      bind:value={$autoPrefixTag}
      label="Tag to prepend ($filterLang is replaced by your filter language)"
    />
  {/if}
  <div class="p-2 rounded bg-gray-800">
    <div class="flex flex-row items-center">
      <h6 class="flex-1 pl-2">Macros</h6>
      <SvgButton
        transparent
        path={mdiPlus}
        on:click={createNewMacro}
        color="white"
        add="flex-none self-end"
      />
    </div>
    <TextField
      rules={leaderCharRules}
      bind:value={macroLeader}
      label="Macro trigger character"
    />
    {#each $macros as macro, id}
      <CustomMacro {...macro} {id} />
    {/each}
  </div>
  <Row>
    <ExpansionPanels>
      <ExpansionPanel>
        <span slot="header">How to use macros</span>
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
      </ExpansionPanel>
    </ExpansionPanels>
  </Row>
{/if}
{#if isAndroid}
  <p>
    <Icon path={mdiInformation} />
    Some features are only supported on the desktop LiveTL extension. Get LiveTL
    on Chrome, Firefox, etc. to use these features!
  </p>
{/if}
