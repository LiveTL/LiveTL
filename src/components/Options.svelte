<script>
  import Settings from './Settings.svelte';

  // Hot reload window.mchad
  // TODO delete before pr
  import * as mchad from '../js/mchad.js';
  import { onMount } from 'svelte';

  onMount(() => {
    window.mchad = mchad;
  });
</script>

<Settings />
