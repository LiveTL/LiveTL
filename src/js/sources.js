import { Queue } from './queue';
import { writable } from 'svelte/store';


export const sources = {
  translations: writable({
    text: 'Test entry 1', author: 'Author 1'
  }),
  ytc: ytcSource(window)
};

function getYTCData(unparsed) {
  const data = JSON.parse(JSON.stringify(unparsed.data));
  return typeof data == 'string' ? JSON.parse(data) : data;
}

function ytcToMsg({ message, author: { name: author } }) {
  const text = message.filter(item => item.type === 'text').join('');
  return { text, author };
}

function ytcSource(window) {
  const ytc = writable(
    { type: 'info', time: 0 } ||
    { type: 'message', messages: [{ author: '', text: '', timestamp: '' }] }
  );
  const lessMsg = (m1, m2) => m1.showtime - m2.showtime;
  const queued = new Queue();
  let interval = null;

  window.addEventListener('message', async d => {
    const data = getYTCData(d);
    if (data.event === 'infoDelivery') {
      await data.set({ type: 'info', time: data.info.currentTime });
    }
    else if (data.type === 'messageChunk') {
      for (const message of data.messages.sort(lessMsg)) {
        const timestamp = data.isReplay
          ? (Date.now() + message.showtime) / 1000
          : message.showtime;
        queued.push({ timestamp, message });
      }
      if (!interval && !data.isReplay) {
        interval = setInterval(() => { }, 250);
      }
    }
  });
  ytc.set(null);
  return ytc;
}

function message(author, msg, timestamp) {
  const showtime = timestamp
    .split(':')
    .map(e => parseInt(e))
    .reduce((l, r) => l * 10 + r);
  return {
    author: { name: author }, message: [{ type: 'text', text: msg }], timestamp, showtime
  };
}

export class DummyYTCEventSource {
  constructor() {
    this.subs = [];
    this.events = [
      { event: 'infoDelivery', info: { currentTime: 0 } },
      {
        type: 'messageChunk',
        isReplay: false,
        messages: [
          message('Author 2', 'Hey there', '03:16 PM'),
          message('Author 1', 'Hello there', '03:15 PM')
        ]
      },
      {
        type: 'messageChunk',
        isReplay: false,
        messages: [
          message('Author 4', '[en] hello there', '03:18 PM'),
          message('Author 3', '[es] hola allí', '03:17 PM')
        ]
      },
      {
        type: 'messageChunk',
        isReplay: false,
        messages: [ message('Author 5', 'hello again', '03:19 PM') ]
      }
    ];
  }

  async start() {
    for (const data of this.events) {
      for (const sub of this.subs) {
        await sub({ data });
      }
    }
  }

  addEventListener(_eventType, cb) {
    this.subs.push(cb);
  }
}