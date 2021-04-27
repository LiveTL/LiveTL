import { Queue } from './queue';
// eslint-disable-next-line no-unused-vars
import { writable, Writable } from 'svelte/store';
import { isLangMatch, parseTranslation, isWhitelisted as textWhitelisted, isBlacklisted as textBlacklisted, authorWhitelisted, authorBlacklisted } from './filter';
import { channelFilters, language, showModMessage } from './store';
import { AuthorType, languageNameCode } from './constants';


/** @typedef {{text: String, author: String, timestamp: String, id: String, types: Number}} Message*/

/** @type {{ translations: Writable<Message>, mod: Writable<Message> ytc: Writable<Message>}} */
export const sources = {
  translations: writable(null),
  mod: writable(null),
  ytc: ytcSource(window).ytc
};

/** @type {(id: String) => Boolean} */
const userBlacklisted = id => channelFilters.get(id).blacklist;

/** @type {(msg: Message) => Boolean} */
const isWhitelisted = msg => textWhitelisted(msg.text) || authorWhitelisted(msg.id);

/** @type {(msg: Message) => Boolean} */
const isBlacklisted = msg => textBlacklisted(msg.text) || userBlacklisted(msg.id) || authorBlacklisted(msg.id);

/** @type {(msg: Message) => Boolean} */
const isMod = msg => msg.types & AuthorType.moderator;

/** @type {(msg: Message) => Boolean} */
const showIfMod = msg => isMod(msg) && showModMessage.get();

/** @type {(store: Writable<Message>) => (msg: Message, text: String) => void} */
const setStoreMessage = store => (msg, text) => store.set({...msg, text});

/**
 * @param {Writable<Message>} translations 
 * @param {Writable<Message>} mod
 * @param {Writable<Message>} ytc 
 * @return {() => void} cleanup
 */
function attachFilters(translations, mod, ytc) {
  const setTranslation = setStoreMessage(translations);
  const setModMessage = setStoreMessage(mod);

  return ytc.subscribe(message => {
    if (!message || isBlacklisted(message)) return;
    const text = message.text.trim();
    const parsed = parseTranslation(text);
    const lang = languageNameCode[language.get()];
    if (parsed && isLangMatch(parsed.lang, lang) && parsed.msg) {
      setTranslation(message, parsed.msg);
    }
    else if (isWhitelisted(message) && text) {
      setTranslation(message, text);
    }
    else if (showIfMod(message) && text) {
      setModMessage(message, text);
    }
  });
}

/**
 * @template T
 * @param  {...Writable<T>} stores 
 * @returns {{ store: Writable<T>, cleanUp: VoidFunction}}
 */
export function combineStores(...stores) {
  const combined = writable(null);
  const unsubscribes = stores.map(s => s.subscribe(v => combined.set(v)));
  return {
    store: combined,
    cleanUp() {
      unsubscribes.forEach(u => u());
    }
  };
}

function getYTCData(unparsed) {
  try {
    const data = JSON.parse(JSON.stringify(unparsed.data));
    return typeof data == 'string' ? JSON.parse(data) : data;
  } catch (e) { return {}; }
}

function ytcToMsg({ message, timestamp, author: { name: author, id, types } }) {
  const text = message
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('');
  const typeFlag = types.reduce((flag, t) => flag | AuthorType[t], 0);
  return { text, timestamp, author, id, types: typeFlag };
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
    if (!interval && firstChunkReceived) {
      if (data.event === 'infoDelivery') {
        videoProgressUpdated(data.info.currentTime);
      } else if (data['yt-player-video-progress']) {
        videoProgressUpdated(data['yt-player-video-progress']);
      }
    }
    if (data.type === 'messageChunk') {
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
  const connectionName = parseInt(new URLSearchParams(window.location.search).get('tabid'));
  if (window.chrome && window.chrome.runtime) {
    window.chrome.runtime.onMessage.addListener( (request) => {
      if (request.tabid === connectionName) window.postMessage(request);
    });
  }
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

attachFilters(sources.translations, sources.mod, sources.ytc);
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
