import { Queue } from './queue';
// eslint-disable-next-line no-unused-vars
import { writable, Writable } from 'svelte/store';
import { isLangMatch, parseTranslation } from './filter';
import { language } from './store';
import { languageNameCode } from './constants';


/** @typedef {{text: String, author: String, timestamp: String}} Message*/

/** @type {{ translations: Writable<Message>, ytc: Writable<Message>}} */
export const sources = {
  translations: writable(null),
  ytc: ytcSource(window).ytc
};

attachTranslationFilter(sources.translations, sources.ytc);

/**
 * 
 * @param {Writable<Message>} translations 
 * @param {Writable<Message>} ytc 
 * @return {() => void} cleanup
 */
function attachTranslationFilter(translations, ytc) {
  return ytc.subscribe(message => {
    if (!message) return;
    const parsed = parseTranslation(message.text);
    const lang = languageNameCode[language.get()];
    if (parsed && isLangMatch(parsed.lang, lang)) {
      translations.set({...message, text: parsed.msg });
    }
  });
}

function getYTCData(unparsed) {
  try {
    const data = JSON.parse(JSON.stringify(unparsed.data));
    return typeof data == 'string' ? JSON.parse(data) : data;
  } catch (e) { return {}; }
}

function ytcToMsg({ message, author: { name: author } }) {
  const text = message
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('');
  return { text, author };
}

function compose(...args) {
  return ipt => args.reduceRight((val, func) => func(val), ipt);
}

export function ytcSource(window) {
  /** @type {Writable<Message>} */
  const ytc = writable(null);
  const lessMsg = (m1, m2) => m1.showtime - m2.showtime;
  const queued = new Queue();
  let interval = null;
  let firstChunkReceived = false;
  const progress = { current: null, previous: null };
  const newMessage = compose(ytc.set, ytcToMsg);
  const cleanUp = () => clearInterval(interval);

  const videoProgressUpdated = (time) => {
    if (time < 0) return;
    progress.current = time;
    if (progress.previous == null) progress.previous = time;
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

  const runQueue = compose(videoProgressUpdated, x => x / 1000, Date.now);

  window.addEventListener('message', async d => {
    const data = getYTCData(d);
    if (data.event === 'infoDelivery' && !interval && firstChunkReceived) {
      videoProgressUpdated(data.info.currentTime);
    }
    else if (data.type === 'messageChunk') {
      firstChunkReceived = true;
      for (const message of data.messages.sort(lessMsg)) {
        const timestamp = data.isReplay
          ? message.showtime
          : (Date.now() + message.showtime) / 1000;
        queued.push({ timestamp, message });
      }
      if (!interval && !data.isReplay) {
        interval = setInterval(runQueue, 250);
        runQueue();
      }
    }
  });
  return { ytc, cleanUp };
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