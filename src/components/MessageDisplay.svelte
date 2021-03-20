<script>
  import { TextDirection } from "../js/constants.js";
  export let direction;
  export let items = [
    {
      text: "Test entry 1",
    },
    {
      text: "Test entry 2",
    },
  ];
  $: console.log(direction);
</script>

<div class="messageDisplayWrapper">
  <div
    class="messageDisplay"
    style="align-self: flex-{direction === TextDirection.BOTTOM
      ? 'end'
      : 'start'};
      flex-direction: column{direction === TextDirection.TOP
      ? '-reverse'
      : ''};"
  >
    <div class="message">
      <div class="heading">
        <strong> Welcome to LiveTL! </strong>
      </div>
    </div>
    {#each items as item}
      <div class="message">{item.text}</div>
    {/each}
  </div>
</div>

<style>
  .heading {
    font-size: 1.5em;
  }
  .messageDisplayWrapper {
    height: 100%;
    width: 100%;
    padding: 5px;
    display: flex;
    overflow-x: hidden;
  }

  .messageDisplay {
    display: flex;
  }

  .message {
    margin: 5px;
  }
</style>
