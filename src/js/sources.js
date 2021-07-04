import { Queue } from './queue';
import { compose } from './utils';
// eslint-disable-next-line no-unused-vars
import { writable, Writable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { Message } from './types.js';
import { isLangMatch, parseTranslation, isWhitelisted as textWhitelisted, isBlacklisted as textBlacklisted, authorWhitelisted, authorBlacklisted } from './filter';
import { channelFilters, language, showModMessage, timestamp } from './store';
import { videoId, AuthorType, languageNameCode } from './constants';
import { checkAndSpeak } from './speech.js';
import * as MCHAD from './mchad.js';
import * as API from './api.js';


/** @type {{ translations: Writable<Message>, mod: Writable<Message>, ytc: Writable<Message>, mchad: Readable<Message>, api: Readable<Message>}} */
export const sources = {
  ytcTranslations: writable(null),
  mod: writable(null),
  ytc: ytcSource(window).ytc,
  mchad: combineStores(MCHAD.getArchive(videoId), MCHAD.getLiveTranslations(videoId)).store,
  api: combineStores(API.getArchive(videoId), API.getLiveTranslations(videoId)).store,
};

/** @type {(id: String) => Boolean} */
const userBlacklisted = id => channelFilters.get(id).blacklist;

/** @type {(msg: Message) => Boolean} */
const isWhitelisted = msg => textWhitelisted(msg.text) || authorWhitelisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isBlacklisted = msg => textBlacklisted(msg.text) || userBlacklisted(msg.id) || authorBlacklisted(msg.author);

/** @type {(msg: Message) => Boolean} */
const isMod = msg => (msg.types & AuthorType.moderator) || (msg.types & AuthorType.owner);

/** @type {(msg: Message) => Boolean} */
const showIfMod = msg => isMod(msg) && showModMessage.get();

/** @type {(store: Writable<Message>) => (msg: Message, text: String | undefined) => void} */
const setStoreMessage =
  store => (msg, text) => store.set({ ...msg, text: text ?? msg.text });

const lang = () => languageNameCode[language.get()];

const isTranslation = parsed => parsed && isLangMatch(parsed.lang, lang()) && parsed.msg;

/** @type {(msg: Message) => Message} */
const replaceFirstTranslation = msg => {
  const messageArray = [...msg.messageArray];
  if (messageArray[0].type === 'text') {
    messageArray[0].text = parseTranslation(messageArray[0].text).msg;
  }
  return { ...msg, messageArray };
};

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

function getYTCData(unparsed) {
  try {
    const data = JSON.parse(JSON.stringify(unparsed.data));
    return typeof data == 'string' ? JSON.parse(data) : data;
  } catch (e) { return {}; }
}

function ytcToMsg({ message, timestamp, author: { name: author, id, types } }) {
  const text = message
    .filter(item => item.type === 'text' || item.type === 'link')
    .map(item => item.text)
    .join('');
  const typeFlag = types.reduce((flag, t) => flag | AuthorType[t], 0);
  return { text, timestamp, author, id, types: typeFlag, messageArray: message };
}

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
      if (data.event === 'infoDelivery') {
        videoProgressUpdated(data.info.currentTime);
      } else if (data['yt-player-video-progress']) {
        videoProgressUpdated(data['yt-player-video-progress']);
      }
    }
  };

  const runQueue = compose(videoProgressUpdated, x => x / 1000, Date.now);

  const startVideoProgressUpdatePolling = () => {
    interval = setInterval(runQueue, 250);
    runQueue();
  };

  const extractToMsg = () => (message) => ({
    timestamp: message.showtime / 1000,
    message
  });

  const pushMessagesToQueue = (messages) => messages
    .sort(lessMsg)
    .map(extractToMsg(messages))
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

  const params = new URLSearchParams(window.location.search);
  const isPopout = params.get('popout');
  if (isPopout && !portRegistered) {
    registerClient(
      {
        tabId: parseInt(params.get('tabid')),
        frameId: parseInt(params.get('frameid'))
      }
    );
  }

  window.addEventListener('message', d => {
    const data = getYTCData(d);
    updateVideoProgressBeforeMessages(data);

    if (!isPopout && data.type === 'frameInfo' && !portRegistered) {
      registerClient(data.frameInfo);
    }
  });

  port.onMessage.addListener((payload) => {
    if (payload.type !== 'actionChunk') {
      return;
    }
    firstChunkReceived = true;
    pushMessagesToQueue(payload.messages);
    if (!isPollingProgress() && !payload.isReplay) {
      startVideoProgressUpdatePolling();
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
sources.translations = combineStores(
  sources.ytcTranslations,
  sources.mchad,
  sources.api
).store;
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
