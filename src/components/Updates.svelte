<script>
  import {
    Button,
    Icon,
    ExpansionPanel,
    ExpansionPanels
  } from "svelte-materialify";
  import { lastVersion } from "../js/store.js";
  import Dialog from "./Dialog.svelte";

  const manifest = chrome.runtime.getManifest();
  let active = $lastVersion !== manifest.version;
</script>

<Dialog bind:active>
  <span class="centered">
    <h1>New Update!</h1>
    <h2>LiveTL was updated to the newest version ({manifest.version}).</h2>
  </span>
  <span class="left">
    <ExpansionPanels>
      <ExpansionPanel>
        <span slot="header">Item</span>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellat amet natus
        obcaecati molestiae quas mollitia error modi atque aliquam esse.
      </ExpansionPanel>
      <ExpansionPanel>
        <span slot="header">Item</span>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellat amet natus
        obcaecati molestiae quas mollitia error modi atque aliquam esse.
      </ExpansionPanel>
      <ExpansionPanel>
        <span slot="header">Item</span>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellat amet natus
        obcaecati molestiae quas mollitia error modi atque aliquam esse.
      </ExpansionPanel>
    </ExpansionPanels>
  </span>
  <Button
    transition
    size="default"
    class="blue"
    on:click={() => (active = false)}
  >
    Let's Go!
  </Button>
</Dialog>

<style>
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1rem;
  }
  * {
    text-align: left;
  }
  .centered * {
    text-align: center;
  }
  .left * {
    text-align: left;
  }
</style>
