<script>
  import CustomMacro from './CustomMacro.svelte';
  import { macros } from '../../js/store.js';

  macros.set([{ name: 'peko', expansion: 'pekora', enabled: true }]);
</script>

{#each $macros as macro, id}
  <CustomMacro {...macro} {id} />
{/each}
