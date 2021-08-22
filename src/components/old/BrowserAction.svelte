<script>
  import Options from '../Options.svelte';
  import Wrapper from '../Wrapper.svelte';
  import { MaterialApp } from 'svelte-materialify/src';
</script>

<MaterialApp theme="dark">
  <Wrapper>
    <Options />
  </Wrapper>
</MaterialApp>

<style>
  :global(html) {
    min-width: 500px !important;
    min-height: 500px !important;
  }
</style>
