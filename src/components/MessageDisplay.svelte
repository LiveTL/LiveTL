<script>
  import { onMount, onDestroy } from "svelte";
  import { TextDirection } from "../js/constants.js";
  import { sources } from "../js/sources.js";
  import "../css/splash.css";
  import { Icon } from "svelte-materialify/src";
  import { mdiPencil, mdiEyeOffOutline } from "@mdi/js";
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
    unsubscribe = sources.ytc.subscribe((n) => {
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
      <div class="subheading">
        Translations picked up from the chat will appear here.
      </div>
      <div class="subscripts">
        Please consider
        <a
          id="shareExtension"
          href="https://livetl.github.io/LiveTL"
          target="about:blank">sharing LiveTL with your friends</a
        >,
        <a
          href="https://livetl.github.io/LiveTL/about/review"
          target="about:blank">giving us a 5-star review</a
        >,
        <a href="https://discord.gg/uJrV3tmthg" target="about:blank"
          >joining our Discord server</a
        >,
        <a href="https://github.com/LiveTL/LiveTL" target="about:blank"
          >starring our GitHub repository</a
        >, and
        <a href="https://opencollective.com/livetl" target="about:blank"
          >chipping in a few dollars to help fund future projects (stay tuned)</a
        >!
      </div>
    </div>
    {#each items as item}
      <div class="message" let:hovering>
        <span>{item.text}</span>
        <span class="author"
          >{item.author}
          <span class="messageActions">
            <span class="blueHighlight">
              <Icon path={mdiPencil} size="1em" class="blueHighlight" />
            </span>
            <span class="redHighlight">
              <Icon path={mdiEyeOffOutline} size="1em" />
            </span>
          </span>
        </span>
      </div>
    {/each}
  </div>
</div>

<style>
  .heading {
    font-size: 1.5em;
  }
  .subheading {
    font-size: 1.25em;
  }
  .subscripts {
    font-size: 0.75em;
  }
  .subscripts > a {
    color: inherit !important;
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

  .messageActions {
    display: none;
  }

  .messageActions .blueHighlight :global(.s-icon:hover) {
    color: var(--theme-text-link);
  }
  .messageActions .redHighlight :global(.s-icon:hover) {
    color: #ff2873;
  }

  .message:hover .messageActions {
    display: inline-block !important;
    cursor: pointer;
  }
  .author {
    font-size: 0.75em;
    color: lightgray;
  }

  .message:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.075);
  }
  .message:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
