<script>
  export let isResizing;
</script>

<div style="
display: {isResizing ? 'none' : 'block'};
width: 100%;
height: 100%;
">
  <slot />
</div>
