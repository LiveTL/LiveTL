<script lang="ts">
  import { exioLoadingBarAnimation } from 'exio/svelte';
  import { dataTheme } from '../../ts/storage';
</script>
<div
  use:exioLoadingBarAnimation={{
    fillColor: $dataTheme === 'dark' ? '#0080e9' : '#5dceff'
  }}
  style="background-color: rgba(128, 128, 128, 0.5); height: 5px; width: min(100%, 500px); margin: auto;"
/>
