<script>
  import Row from 'svelte-materialify/src/components/Grid/Row.svelte';
  import Col from 'svelte-materialify/src/components/Grid/Col.svelte';
  import Subheader from 'svelte-materialify/src/components/Subheader.svelte';
  import Button from 'svelte-materialify/src/components/Button/Button.svelte';
  import Icon from 'svelte-materialify/src/components/Icon/Icon.svelte';
  import { mdiPlus } from '@mdi/js';
  import { onMount } from 'svelte';

  import CustomMacro from './CustomMacro.svelte';
  import Toggle from './Toggle.svelte';
  import { macros, doAutoPrefix } from '../../js/store.js';

  const emptyMacro = { name: '', expansion: '', enabled: true };

  const cleanUpMacros =
    () => $macros = $macros.filter(m => m.name + m.expansion);

  const createNewMacro = () => $macros = [...cleanUpMacros(), emptyMacro];

  onMount(() => setTimeout(cleanUpMacros));
</script>

<Toggle name="Auto-prefix chat messages" store={doAutoPrefix} />
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
{#each $macros as macro, id}
  <CustomMacro {...macro} {id} />
{/each}
