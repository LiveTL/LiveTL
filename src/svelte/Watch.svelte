<script>
  import * as j from "jquery";
  import "jquery-ui-bundle";
  import "jquery-ui-bundle/jquery-ui.css";
  window.j = j;
  window.addEventListener("load", () => {
    j(document.querySelectorAll(".tile")[0]).resizable({
      handles: "e",
      start: () => {},
      stop: () => {},
      resize: (event, ui) => {},
      containment: "body",
    });
  });
</script>

<div class="flex vertical">
  <div class="tile resizable" />
  <div class="tile autoscale">
    <div class="flex horizontal">
      <div class="tile" />
      <div class="tile" />
    </div>
  </div>
</div>

<style>
  :root {
    --bar: 10px;
  }
  .resizable {
    width: 50%;
  }
  .autoscale {
    flex: 1;
  }
  .tile {
    background-color: red;
    /* border: 5px solid blue; */
    display: flex;
  }
  .horizontal {
    flex-direction: column;
  }
  .vertical {
    flex-direction: row;
  }
  .flex {
    display: flex;
    height: 100%;
    width: 100%;
  }
  :global(body) {
    height: 100%;
    position: absolute;
    margin: 0;
    width: 100%;
    margin: 0px;
  }
  :global(.ui-resizable-e) {
    width: var(--bar);
    right: 0px;
    background-color: black;
  }
  :global(.ui-resizable-s) {
    height: var(--bar);
    bottom: 0px;
    background-color: black;
  }
</style>
