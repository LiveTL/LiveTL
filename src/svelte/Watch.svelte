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
  <div class="tile" style="width: 50%;" />
  <div class="tile">
    <div class="flex horizontal">
      <div class="tile" />
      <div class="tile" />
    </div>
  </div>
</div>

<style>
  .tile {
    background-color: red;
    /* border: 5px solid blue; */
    /* flex: 1; */
    display: flex;
  }
  .flex > .tile:last-child {
    flex-grow: 1;
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
    width: 10px;
    right: 0px;
    background-color: black;
  }
</style>
