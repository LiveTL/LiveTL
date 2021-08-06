import { Queue } from './queue';
import { compose } from './utils';
// eslint-disable-next-line no-unused-vars
import { derived, writable, Writable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { Message } from './types.js';
import { isLangMatch, parseTranslation, isWhitelisted as textWhitelisted, isBlacklisted as textBlacklisted, authorWhitelisted, authorBlacklisted } from './filter';
import { isTranslation, replaceFirstTranslation } from './filter';
import { channelFilters, language, showModMessage, timestamp } from './store';
import { paramsVideoId, AuthorType, languageNameCode, paramsPopout, paramsTabId, paramsFrameId } from './constants';
import { checkAndSpeak } from './speech.js';
import { removeDuplicateMessages } from './sources-util.js';
import * as MCHAD from './mchad.js';
import * as API from './api.js';


/** @type {{ ytcTranslations: Writable<Message>, mod: Writable<Message>, ytc: Writable<Message>, translations: Writable<Message>, mchad: Readable<Message>, api: Readable<Message>, ytcBonks: Writable<any[]>, ytcDeletions:Writable<any[]> }} */
export const sources = {
  ytcTranslations: writable(null),
  mod: writable(null),
  ytc: ytcSource(window).ytc,
  mchad: combineStores(MCHAD.getArchive(paramsVideoId), MCHAD.getLiveTranslations(paramsVideoId)).store,
  api: combineStores(API.getArchive(paramsVideoId), API.getLiveTranslations(paramsVideoId)).store,
  ytcBonks: writable(null),
  ytcDeletions: writable(null),
};

/** @type {(id: String) => Boolean} */
const userBlacklisted = id => channelFilters.get(id).blacklist;

/** @type {(msg: Message) => Boolean} */
const isWhitelisted = msg => textWhitelisted(msg.text) || authorWhitelisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isBlacklisted = msg => textBlacklisted(msg.text) || userBlacklisted(msg.authorId) || authorBlacklisted(msg.author);

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
    }
    else if (isWhitelisted(message)) {
      setTranslation(message);
    }
    else if (showIfMod(message)) {
      setModMessage(message);
    }
  });
}

/**
 * @param {Writable<Message>} translations
 * @return {() => void} cleanup
 */
function attachSpeechSynth(translations) {
  return translations.subscribe(message => {
    if (message)
      checkAndSpeak(message.text);
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
    messageId: ytcMessage.messageId
  };
}

/**@param {Window} window */
export function ytcSource(window) {
  /** @type {Writable<Message>} */
  const ytc = writable(null);
  const lessMsg = (m1, m2) => m1.showtime - m2.showtime;
  const queued = new Queue();
  let interval = null;
  let firstChunkReceived = false;

  const progress = { previous: null };
  const newMessage = compose(ytc.set, ytcToMsg);
  const cleanUp = () => clearInterval(interval);

  const isPollingProgress = () => !!interval;

  const pushQueuedToStore = condition => {
    while (queued.top != null && condition(queued)) {
      newMessage(queued.pop().data.message);
    }
  };

  const pushAllQueuedToStore = () => pushQueuedToStore(() => true);
  const pushUpToCurrentToStore = (currentTime) =>
    pushQueuedToStore(q => q.top.data.timestamp <= currentTime);

  const scrubbedOrSkipped = (time) =>
    time == null || Math.abs(progress.previous - time) > 1;

  const videoProgressUpdated = (time) => {
    if (time < 0) return;
    if (scrubbedOrSkipped(time)) {
      pushAllQueuedToStore();
    } else {
      pushUpToCurrentToStore(time);
    }
    progress.previous = time;
    timestamp.set(time);
  };

  const updateVideoProgressBeforeMessages = data => {
    if (!isPollingProgress() && firstChunkReceived) {
      videoProgressUpdated(data);
    }
  };

  const runQueue = compose(videoProgressUpdated, x => x / 1000, Date.now);

  const startVideoProgressUpdatePolling = () => {
    interval = setInterval(runQueue, 250);
    runQueue();
  };

  const extractToMsg = (message) => ({
    timestamp: message.showtime / 1000,
    message
  });

  const pushMessagesToQueue = (messages) => messages
    .sort(lessMsg)
    .map(extractToMsg)
    .forEach(item => queued.push(item));

  /** Connect to background messaging as client */
  const port = chrome.runtime.connect();
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

  const filterDeleted = (message, bonks, deletions) => {
    return !(bonks.some((b) => b.authorId === message.author.id) ||
      deletions.some((d) => d.messageId === message.messageId));
  };

  port.onMessage.addListener((payload) => {
    if (payload.type === 'actionChunk') {
      firstChunkReceived = true;
      const messages = payload.messages.filter(
        (m) => filterDeleted(m, payload.bonks, payload.deletions)
      );
      sources.ytcBonks.set(payload.bonks);
      sources.ytcDeletions.set(payload.deletions);
      pushMessagesToQueue(messages);
      if (!isPollingProgress() && !payload.isReplay) {
        startVideoProgressUpdatePolling();
      }
    } else if (payload.type === 'playerProgress') {
      updateVideoProgressBeforeMessages(payload.playerProgress);
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

attachFilters(sources.ytcTranslations, sources.mod, sources.ytc);
sources.translations = removeDuplicateMessages(combineStores(
  sources.ytcTranslations,
  sources.mchad,
  sources.api
).store);
attachSpeechSynth(sources.translations);

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
