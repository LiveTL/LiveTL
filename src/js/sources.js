import { compose } from './utils';
import { writable, readable, derived } from 'svelte/store';
import {
  parseTranslation,
  isWhitelisted as textWhitelisted,
  isBlacklisted as textBlacklisted,
  authorWhitelisted,
  authorBlacklisted,
  isTranslation,
  replaceFirstTranslation
} from './filter';
import { showModMessage, showVerifiedMessage, timestamp } from './store';
import { paramsYtVideoId, AuthorType, paramsPopout, paramsTabId, paramsFrameId, paramsTwitchUrl } from './constants';
import { twitchSource } from '../ts/sources';
// import * as API from './api.js';
import * as TLDEX from './tldex.js';
import { useReconnect } from '../submodules/chat/src/ts/chat-utils.ts';

/**
 * @typedef {import('svelte/store').Readable} Readable
 * @typedef {import('svelte/store').Writable} Writable
 * @typedef {import('./types.js').Message} Message
 * @typedef {{ chatTranslations: Writable<Message>, mod: Writable<Message>, verified: Writable<Message>, chat: Writable<Message> }} YTCSources
 */

const tldex = derived(
  combineStores(TLDEX.getArchive(paramsTwitchUrl ?? paramsYtVideoId), TLDEX.getLiveTranslations(paramsYtVideoId)).store,
  ($message) => {
    if (!$message) return;
    const parsed = parseTranslation($message.text);
    if (isTranslation(parsed)) {
      $message = replaceFirstTranslation($message);
      $message.text = parsed.msg;
    }
    return $message;
  }
);

/** @type {YTCSources & { translations: Writable<Message>, mchad: Readable<Message>, api?: Readable<Message>, ytcBonks: Writable<any[]>, ytcDeletions:Writable<any[]>, thirdParty: Writable<Message> }} */
export const sources = {
  chatTranslations: writable(null),
  mod: writable(null),
  verified: writable(null),
  chat: (paramsTwitchUrl ?? '') ? twitchSource() : ytcSource(window).ytc,
  // api: combineStores(API.getArchive(paramsVideoId), API.getLiveTranslations(paramsVideoId)).store,
  thirdParty: createThirdPartyStore(),
  ytcBonks: writable(null),
  ytcDeletions: writable(null),
  tldex
};

/** @type {(msg: Message) => Boolean} */
const isWhitelisted = msg => textWhitelisted(msg.text) || authorWhitelisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isBlacklisted = msg => textBlacklisted(msg.text) || authorBlacklisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isMod = msg => (msg.types & AuthorType.moderator) || (msg.types & AuthorType.owner);

/** @type {(msg: Message) => Boolean} */
const showIfMod = msg => isMod(msg) && showModMessage.get();

/** @type {(msg: Message) => Boolean} */
const showIfVerified = msg => (msg.types & AuthorType.verified) && showVerifiedMessage.get();

/** @type {(store: Writable<Message>) => (msg: Message, text?: String) => void} */
const setStoreMessage =
  store => (msg, text) => store.set({ ...msg, text: text ?? msg.text });

/** @type {(sources: YTCSources) => () => void} */
function attachFilters({ chatTranslations, mod, verified, chat }) {
  const setTranslation = setStoreMessage(chatTranslations);
  const setModMessage = setStoreMessage(mod);
  const setVerifiedMessage = setStoreMessage(verified);

  return chat.subscribe(message => {
    if (!message || isBlacklisted(message)) return;
    const text = message.text.trim();
    const parsed = parseTranslation(text);

    if (text && isTranslation(parsed)) {
      setTranslation(replaceFirstTranslation(message), parsed.msg);
    } else if (text && isWhitelisted(message)) {
      setTranslation(message);
    } else if (showIfMod(message)) {
      setModMessage(message);
    } else if (showIfVerified(message)) {
      setVerifiedMessage(message);
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

function createThirdPartyStore() {
  return readable(null, set => {
    const cb = event => {
      if (event?.data?.type === 'third-party-set') {
        set(event.data.message);
      }
    };
    window.addEventListener('message', cb);
    return () => window.removeEventListener(cb);
  });
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

  let portRegistered = false;
  let tryRegister = 0;

  /**
   * Youtube live_chat frame sends a frameInfo message with the yt frame id.
   * It is important to use this because when opening LiveTL, the frameid and
   * tabid of the yt frame change so we need updated ids.
   *
   * Also, in "Open in LiveTL" mode, no tabid/frameid params are given.
   *
   * We need frameid as well as tabid because we may have multiple livetls in
   * one page (eg. holodex).
   *
   * @type {() => Promise<Chat.FrameInfo>}
   */
  const postMessageFrameInfo = () => new Promise((res) => {
    const listener = (d) => {
      if (d.data.type === 'frameInfo') {
        removeEventListener('message', listener);
        res(d.data.frameInfo);
      }
    };
    addEventListener('message', listener);
  });

  const port = useReconnect(async () => {
    /** @type {Chat.FrameInfo} */
    const frameInfo = paramsPopout
      ? { tabId: parseInt(paramsTabId), frameId: parseInt(paramsFrameId) }
      : await postMessageFrameInfo();

    /** @type {Chat.Port} */
    let port;
    try {
      port = chrome.runtime.connect({
        name: JSON.stringify(frameInfo)
      });
    } catch (e) {
      console.error('Failed to connect to bg port', e);
    }

    const registerClient = () => {
      port.postMessage({
        type: 'registerClient',
        getInitialData: true
      });
    };

    port.onMessage.addListener((response) => {
      switch (response.type) {
        case 'messages':
          response.messages.forEach((m) => newMessage(m.message));
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
        case 'registerClientResponse':
          if (response.success) {
            portRegistered = true;
            break;
          }
          if (tryRegister < 3) {
            tryRegister++;
            setTimeout(registerClient, 500);
          } else {
            console.error(`Failed to connect to YTC source after 3 attempts: ${response.failReason}`);
          }
          break;
      }
    });

    registerClient();

    return port;
  });

  return { ytc, cleanUp: () => port && port.destroy() };
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

attachFilters(sources);
sources.translations = combineStores(
  sources.chatTranslations,
  sources.tldex
  // sources.api
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
