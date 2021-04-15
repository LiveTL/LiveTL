<script>
  export let fontSize;
</script>

<div
  style="
  margin-bottom: 20px;
  font-size: {Math.round(
    fontSize
  )}px;
  background-color: darken(var(--theme-cards), 50%);
  padding: 5px;
"
>
  Sample text
</div>
