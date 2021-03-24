<script>
  import Options from "../components/Options.svelte";
  import Wrapper from "./Wrapper.svelte";
  import { MaterialApp } from "svelte-materialify/src";
</script>

<MaterialApp theme="dark">
  <Wrapper>
    <Options isStandalone />
  </Wrapper>
</MaterialApp>

<style>
  :global(html) {
    min-width: 500px !important;
    min-height: 400px !important;
  }
</style>
