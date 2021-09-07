import { compose } from './utils';
import { derived, writable } from 'svelte/store';
import {
  parseTranslation,
  isWhitelisted as textWhitelisted,
  isBlacklisted as textBlacklisted,
  authorWhitelisted,
  authorBlacklisted,
  isTranslation,
  replaceFirstTranslation
} from './filter';
import { showModMessage, timestamp } from './store';
import { paramsVideoId, AuthorType, paramsPopout, paramsTabId, paramsFrameId } from './constants';
import * as MCHAD from './mchad.js';
import * as API from './api.js';

/**
 * @typedef {import('svelte/store').Readable} Readable
 * @typedef {import('svelte/store').Writable} Writable
 * @typedef {import('./types.js').Message} Message
 */

/** @type {{ ytcTranslations: Writable<Message>, mod: Writable<Message>, ytc: Writable<Message>, translations: Writable<Message>, mchad: Readable<Message>, api: Readable<Message>, ytcBonks: Writable<any[]>, ytcDeletions:Writable<any[]> }} */
export const sources = {
  ytcTranslations: writable(null),
  mod: writable(null),
  ytc: ytcSource(window).ytc,
  mchad: combineStores(MCHAD.getArchive(paramsVideoId), MCHAD.getLiveTranslations(paramsVideoId)).store,
  api: combineStores(API.getArchive(paramsVideoId), API.getLiveTranslations(paramsVideoId)).store,
  ytcBonks: writable(null),
  ytcDeletions: writable(null)
};

/** @type {(msg: Message) => Boolean} */
const isWhitelisted = msg => textWhitelisted(msg.text) || authorWhitelisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isBlacklisted = msg => textBlacklisted(msg.text) || authorBlacklisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isMod = msg => (msg.types & AuthorType.moderator) || (msg.types & AuthorType.owner);

/** @type {(msg: Message) => Boolean} */
const showIfMod = msg => isMod(msg) && showModMessage.get();

/** @type {(store: Writable<Message>) => (msg: Message, text?: String) => void} */
const setStoreMessage =
  store => (msg, text) => store.set({ ...msg, text: text ?? msg.text });

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
    if (!text) return;
    if (isTranslation(parsed)) {
      setTranslation(replaceFirstTranslation(message), parsed.msg);
    } else if (isWhitelisted(message)) {
      setTranslation(message);
    } else if (showIfMod(message)) {
      setModMessage(message);
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

/**
 * @param {Ytc.ParsedMessage} ytcMessage
 * @returns {Message}
 */
function ytcToMsg(ytcMessage) {
  const text = ytcMessage.message
    .filter(item => item.type === 'text' || item.type === 'link')
    .map(item => item.text)
    .join('');
  const author = ytcMessage.author;
  const typeFlag = author.types.reduce((flag, t) => flag | AuthorType[t], 0);
  return {
    text,
    timestamp: ytcMessage.timestamp,
    author: author.name,
    authorId: author.id,
    types: typeFlag,
    messageArray: ytcMessage.message,
    messageId: ytcMessage.messageId,
    timestampMs: ytcMessage.showtime
  };
}

/** @param {Window} window */
export function ytcSource(window) {
  /** @type {Writable<Message>} */
  const ytc = writable(null);
  const newMessage = compose(ytc.set, ytcToMsg);

  /* Connect to background messaging as client */
  /** @type {Chat.Port} */
  let port;
  try {
    port = chrome.runtime.connect();
  } catch {
    return { ytc, cleanUp: () => {}};
  }
  let portRegistered = false;
  const registerClient = (frameInfo) => {
    port.postMessage({
      type: 'registerClient',
      frameInfo: frameInfo,
      getInitialData: false
    });
    portRegistered = true;
  };

  if (paramsPopout && !portRegistered) {
    registerClient(
      {
        tabId: parseInt(paramsTabId),
        frameId: parseInt(paramsFrameId)
      }
    );
  }

  window.addEventListener('message', (d) => {
    if (!paramsPopout && d.data.type === 'frameInfo' && !portRegistered) {
      registerClient(d.data.frameInfo);
    }
  });

  port.onMessage.addListener((response) => {
    switch (response.type) {
      case 'message':
        newMessage(response.message);
        break;
      case 'bonk': // TODO: No need to use arrays anymore
        sources.ytcBonks.set([response.bonk]);
        break;
      case 'delete':
        sources.ytcDeletions.set([response.deletion]);
        break;
      case 'playerProgress':
        timestamp.set(response.playerProgress);
        break;
    }
  });

  return { ytc, cleanUp: () => port.disconnect() };
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

attachFilters(sources.ytcTranslations, sources.mod, sources.ytc);
sources.translations = combineStores(
  sources.ytcTranslations,
  sources.mchad,
  sources.api
).store;

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
        messages: [message('Author 5', 'hello again', '03:19 PM')]
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
