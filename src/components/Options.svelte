<script lang="ts">
  import Settings from './Settings.svelte';
  import dark from 'smelte/src/dark';

  // So options_ui css isn't shit
  dark().set(true);
</script>

<div class="bg-dark-700">
  <Settings />
</div>
