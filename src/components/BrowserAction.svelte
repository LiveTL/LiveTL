<script>
  import Options from "../components/Options.svelte";
  import Wrapper from "./Wrapper.svelte";
  import { MaterialApp } from "svelte-materialify/src";
  import { livetlZoom } from "../js/store.js";
</script>

<MaterialApp theme="dark">
  <Wrapper zoom={$livetlZoom}>
    <Options isStandalone />
  </Wrapper>
</MaterialApp>

<style>
  :global(html) {
    min-width: 500px !important;
    min-height: 400px !important;
  }
</style>
