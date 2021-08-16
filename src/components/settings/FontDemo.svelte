<script lang="ts">
  export let fontSize: number;

  $: fontSize = Math.round(fontSize);
</script>

<div
  class="mt-2 mb-3"
  style="font-size: {fontSize}px;"
>
  Sample text
</div>
