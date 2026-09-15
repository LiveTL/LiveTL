<script lang="ts">
  export let fontSize: number;

  $: fontSize = Math.round(fontSize);
</script>

<div style="font-size: {fontSize}px;">
  Sample text
</div>
