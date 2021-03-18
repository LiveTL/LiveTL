<div class="flex vertical">
  <div class="tile" />
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
    border: 5px solid blue;
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
  body {
    margin: 0px;
  }
</style>
