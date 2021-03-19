<script>
  export let isResizing;
  export let zoom = NaN;
  export let position = "relative";
  let factor;
  $: factor = zoom || 1;
  let inverse;
  $: inverse = 100 / factor;
  $: console.log(zoom, factor, inverse);
</script>

<div
  style="
display: {isResizing
    ? 'none'
    : 'block'};
width: {inverse}%;
height: {inverse}%;
transform-origin: 0px 0px;
transform: scale({factor});
overflow: auto;
position: {position};
"
>
  <slot />
</div>
