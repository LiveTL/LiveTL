<script>
  import Settings from "./Settings.svelte";

  export let name;
</script>

<h1>Hello {name}!</h1>
<img alt="logo" src="/icon-128.png" />

<style>
  h1 {
    color: blue;
  }
</style>
