<script>
  import { Col, Row, Subheader, Button, Icon, ExpansionPanels, ExpansionPanel, TextField } from 'svelte-materialify/src';
  import { mdiPlus } from '@mdi/js';
  import { onMount } from 'svelte';

  import CustomMacro from '../options/CustomMacro.svelte';
  import Toggle from '../options/Toggle.svelte';
  import { macros, doAutoPrefix, doTranslatorMode, autoPrefixTag, language } from '../../js/store.js';

  const emptyMacro = { name: '', expansion: '', enabled: true };

  const cleanUpMacros =
    () => $macros = $macros.filter(m => m.name + m.expansion);

  const createNewMacro = () => $macros = [...cleanUpMacros(), emptyMacro];

  onMount(() => setTimeout(cleanUpMacros));
</script>

<Toggle name="Translator mode" store={doTranslatorMode} />
{#if $doTranslatorMode}
  <Toggle name="Auto-prefix chat messages" store={doAutoPrefix} />
  {#if $doAutoPrefix}
    <TextField style="margin-top: 20px;" bind:value={$autoPrefixTag}
      >Tag to prepend (<strong>$filterLang</strong> is replaced by your filter language)</TextField
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
  <Row>
    <ExpansionPanels>
      <ExpansionPanel>
        <span slot="header">How to use</span>
        <p>
          Macros are identified by a name and will expand to the expansion when
          typed.
        </p>
        <p>
          To use macros, type a / in chat and start typing in the name of a
          macro.
        </p>
        <p>
          Suggestions will appear under the chat entry box which can be cycled
          through with the tab key
        </p>
        <p>
          When you have your macro suggestion highlighted, hit space and the
          macro will expand
        </p>
      </ExpansionPanel>
    </ExpansionPanels>
  </Row>
  <Row>
    <div style="height: 1rem" />
  </Row>
  {#each $macros as macro, id}
    <CustomMacro {...macro} {id} />
  {/each}
{/if}
