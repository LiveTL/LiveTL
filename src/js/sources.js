import { writable } from 'svelte/store';


export const sources = {
  translations: writable({
    text: 'Test entry 1', author: 'Author 1'
  }),
  chat: ytcSource(window)
};

function getYTCData(unparsed) {
  const data = JSON.parse(JSON.stringify(unparsed.data));
  return typeof data == 'string' ? JSON.parse(data) : data;
}

function ytcSource(window) {
  const chat = writable({ text: 'Test entry 1', author: 'Author 1' });
  window.addEventListener('message', async d => {
    const data = getYTCData(d);
    // if (data.event === 'infoDelivery') { }
  });
  return chat;
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
          message('Author 3', '[es] hola eso', '03:17 PM')
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