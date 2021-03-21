<script>
  import { onMount, onDestroy } from "svelte";
  import { TextDirection } from "../js/constants.js";
  import { sources } from "../js/sources.js";
  import "../css/splash.css";
  export let direction;
  export let items = [
    {
      text: "Test entry 1",
      author: "Author 1",
    },
    {
      text: "Test entry 2",
      author: "Author 2",
    },
  ];

  let unsubscribe = null;
  onMount(() => {
    unsubscribe = sources.ytc.subscribe(n => {
      if (n) items.push(n);
      items = items;
    });
  });
  onDestroy(() => unsubscribe());

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
      <div class="message">
        <span>{item.text}</span>
        <span class="author">{item.author}</span>
      </div>
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
    display: flex;
    overflow-x: hidden;
  }

  .messageDisplay {
    display: flex;
    max-height: 100%;
    width: 100%;
  }

  .message {
    --margin: 2.5px;
    margin: var(--margin);
    padding: calc(1.5 * var(--margin));
    width: calc(100% - 2 * var(--margin));
    animation: splash 1s normal forwards ease-in-out;
    border-radius: var(--margin);
  }

  .author {
    font-size: 0.6em;
    color: lightgray;
  }

  .message:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.075);
  }
  .message:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
