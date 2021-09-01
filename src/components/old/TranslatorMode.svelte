<script>
  import { Col, Row, Subheader, Button, Icon, ExpansionPanels, ExpansionPanel, TextField } from 'svelte-materialify/src';
  import { mdiInformation, mdiPlus } from '@mdi/js';
  import { onMount } from 'svelte';

  import CustomMacro from '../options/CustomMacro.svelte';
  import Toggle from '../options/Toggle.svelte';
  import { macros, doAutoPrefix, doTranslatorMode, autoPrefixTag, macroTrigger } from '../../js/store.js';
  import { isAndroid } from '../../js/constants.js';

  const leaderCharRules = [
    leader => leader.length == 1 || 'Please input a single character'
  ];

  const emptyMacro = { name: '', expansion: '', enabled: true };

  const cleanUpMacros =
    () => $macros = $macros.filter(m => m.name + m.expansion);

  const createNewMacro = () => $macros = [...cleanUpMacros(), emptyMacro];

  $: macroLeader = $macroTrigger;
  $: if (leaderCharRules[0](macroLeader) === true) {
    macroTrigger.set(macroLeader);
  }

  onMount(() => setTimeout(cleanUpMacros));
</script>

<Toggle name="Translator mode" store={doTranslatorMode} disabled={isAndroid} />
{#if $doTranslatorMode}
  <div style="margin-top: 20px;">
    <Toggle name="Auto-prefix chat messages" store={doAutoPrefix} />

    {#if $doAutoPrefix}
      <TextField style="margin-top: 20px;" bind:value={$autoPrefixTag}
        >Tag to prepend (<strong>$filterLang</strong> is replaced by your filter
        language)</TextField
      >
    {/if}
    <Row>
      <Col>
        <Subheader>Macros</Subheader>
      </Col>
      <Col style="padding-right: 2px;">
        <Subheader style="float: right; padding-right: 0px">
          <Button icon on:click={createNewMacro}>
            <Icon path={mdiPlus} />
          </Button>
        </Subheader>
      </Col>
    </Row>
    <TextField rules={leaderCharRules} bind:value={macroLeader}>
      Macro trigger character
    </TextField>
    {#each $macros as macro, id}
      <CustomMacro {...macro} {id} />
    {/each}
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
  </div>
{/if}
{#if isAndroid}
  <p>
    <Icon path={mdiInformation} />
    Some features are only supported on the desktop LiveTL extension. Get LiveTL
    on Chrome, Firefox, etc. to use these features!
  </p>
{/if}
