import { getStorage, setDefaultSetting } from './storage.js';

// TranslatorMode.run()
// Make sure to setTimeout when running at initialization

let [container, chatbox] = document.querySelectorAll('#input');
const defaultt = false;
let sendButton = document.querySelector('#send-button');
const postMessage = window.parent.postMessage;

async function init() {
  await setupDefaultTranslatorMode();
  if (!is_ytc()) {
    ltl_run();
  }
}

export async function run() {
  if (is_ytc()) {
    await ytc_run();
    window.addEventListener('click', e => {
      if (switchedChat(e)) {
        rebindChatbox();
      }
    });
  }
}

export async function setupDefaultTranslatorMode() {
  return await setDefaultSetting('translatorMode', defaultt);
}

function switchedChat(e) {
  e = e.target;
  while (e.parentElement) {
    if (e.tagName === 'A' && e.getAttribute('aria-selected')) {
      return true;
    }
    e = e.parentElement;
  }
  return false;
}

function rebindChatbox() {
  setTimeout(async () => {
    chatbox.removeEventListener('keydown', checkAndAddTLTag);
    sendButton.removeEventListener('mouseup', checkAndAddTLTag);
    chatbox.removeEventListener('focus', checkAndAddTLTag);
    [container, chatbox] = document.querySelectorAll('#input');
    await ytc_run();
  }, 1000);
}

async function ytc_run() {
  if (chatbox) {
    chatbox.style.whiteSpace = `pre-wrap`;
    chatbox.addEventListener('keydown', checkAndAddTLTag);
    sendButton.addEventListener('mouseup', checkAndAddTLTag);
    chatbox.addEventListener('focus', checkAndAddTLTag);
  }
}

function is_ytc() {
  return isLiveChat();
}

export async function enabled() {
  return await getStorage('translatorMode');
}

export function disable() {
  clearTextFromYTC();
}

export function reload() {
  clearTextFromYTC();
  run();
}

function ltl_run() {
  TranslatorMode.disable = () => {
    postMessage({ type: 'translatorMode', fn: 'disable' });
  };
  TranslatorMode.reload = () => {
    postMessage({ type: 'translatorMode', fn: 'reload' });
  };
}

function clearTextFromYTC() {
  if (chatbox.textContent) {
    chatbox.textContent = '';
    container.removeAttribute('has-text');
  }
}

async function checkAndAddTLTag() {
  const langTag = await getLangTag();
  if (chatbox.textContent === '' && await enabled()) {
    addTextToYTC(`[${langTag}] `);
  }
}

async function getLangTag() {
  const current = await getDefaultLanguage();
  if (current) {
    return languageConversionTable[current].code;
  } else {
    return 'en';
  }
  return 'en';
}

function addTextToYTC(text) {
  container.setAttribute('has-text', '');
  chatbox.textContent = text;
  setCaret(chatbox, text.length);
}

function setCaret(el, pos) {
  var range = document.createRange();
  var sel = window.getSelection();
  range.setStart(el.childNodes[0], pos);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}

init();

// module.exports = { TranslatorMode };
