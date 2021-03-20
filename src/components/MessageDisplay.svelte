<script>
  import { TextDirection } from "../js/constants.js";
  import { Queue } from "../js/queue.js";
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

  let queued = new Queue();
  let progress = {
    current: null,
    previous: null,
  };
  let interval = null;
  const newMessage = async (message) => {
    let text = "";
    message.message.forEach((item) => {
      if (item.type === "text") text += item.text;
    });
    items = [...items, { text, author: message.author.name }];
  };
  const videoProgressUpdated = (time) => {
    if (time < 0) return;
    progress.current = time;
    if (
      Math.abs(progress.previous - progress.current) > 1 &&
      progress.current != null
    ) {
      // scrubbed or skipped
      while (queued.top) {
        newMessage(queued.pop().data.message);
      }
    } else {
      while (
        queued.top != null &&
        queued.top.data.timestamp <= progress.current
      ) {
        const item = queued.pop();
        newMessage(item.data.message);
      }
    }
    progress.previous = progress.current;
  };
  window.addEventListener("message", async (d) => {
    d = JSON.parse(JSON.stringify(d.data));
    if (typeof d === "string") d = JSON.parse(d);
    if (d.event === "infoDelivery" && !interval) {
      videoProgressUpdated(d.info.currentTime);
    } else if (d.type === "messageChunk") {
      if (!d.isReplay && !interval) {
        const runQueue = () => {
          videoProgressUpdated(Date.now() / 1000);
        };
        interval = setInterval(runQueue, 250);
        runQueue();
      }
      for (const message of d.messages.sort(
        (m1, m2) => m1.showtime - m2.showtime
      )) {
        let timestamp = (Date.now() + message.showtime) / 1000;
        if (d.isReplay) timestamp = message.showtime;
        queued.push({
          timestamp,
          message: message,
        });
      }
    }
  });
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
    font-size: 0.75em;
  }

  .message:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.075);
  }
  .message:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
