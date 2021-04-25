import { getWAR, getFile, languages, decodeURIComponentSafe, customTags, customUsers } from './lib/constants.js';
import { importFontAwesome, importStyle } from './lib/css.js';
import { isLangMatch, parseTranslation } from './lib/filter.js';
import { Marine } from './lib/marine.js';
import { createSettings, updateZoomLevel } from './lib/settings.js';
import { checkAndSpeak } from './lib/speech.js';
import {
  isNewUser,
  saveUserStatus,
  getUserStatus,
  getUserStatusAsBool,
  getStorage,
  setStorage,
  isChecked,
  resetUserStatus,
  getJSON
} from './lib/storage.js';
import { hideSVG, banSVG } from './lib/svgs.js';
import * as TranslatorMode from './lib/translator-mode.js';
import { isFirefox, isAndroid, parseParams } from './lib/web-constants.js';
import { languageConversionTable, allTranslators, allTranslatorCheckbox } from './lib/constants.js';

const invalidUnicode = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

if (isAndroid) {
  window.chrome = {
    runtime: {
      sendMessage: () => { },
      onMessage: {
        addListener: () => { }
      }
    }
  };
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const embedDomain = EMBED_DOMAIN;

let showTimestamps = true;
let textDirection = 'bottom';
const INTERVAL = 100;

async function addedByUser(id) {
  id = id.trim().toLowerCase();
  let s = (await getUserStatus(id, true)).checked != null;
  return s;
}

// javascript 'enum'
const authorType = {
  MOD: 'Moderator',
  VERIFIED: 'Verified',
  DISTINGUISHED: 'Distinguished', // subject to change
  STANDARD: 'Standard'
};

async function runLiveTL() {
  monkeypatch();

  params = parseParams();
  await setFavicon();

  await switchChat();
  document.title = decodeURIComponentSafe(params.title) || 'LiveTL Chat';

  await Promise.all([importFontAwesome(), importStyle()]);

  const livetlContainer = document.createElement('div');
  livetlContainer.className = 'livetl';
  document.body.appendChild(livetlContainer);
  if (params.devMode) {
    livetlContainer.style.opacity = '50%';
  }
  const translationDiv = document.createElement('div');
  translationDiv.className = 'translationText';

  livetlContainer.appendChild(translationDiv);

  getDimensions = () => ({
    clientHeight: livetlContainer.clientHeight,
    scrollTop: livetlContainer.scrollTop,
    scrollHeight: livetlContainer.scrollHeight
  });

  scrollToBottom = (dims, force = false) => {
    if ((dims.clientHeight + dims.scrollTop + 25 >= dims.scrollHeight &&
      translationDiv.style.display !== 'none') || force) {
      livetlContainer.scrollTo(0, livetlContainer.scrollHeight + dims.clientHeight);
    }
  };

  window.updateDimensions = (dims, force = false, goToTop = false) => {
    dims = dims || getDimensions();
    if (goToTop) {
      livetlContainer.scrollTo(0, 0);
    } else {
      if (textDirection !== 'top') {
        scrollToBottom(dims, force);
      }
    }
  };

  let dimsBefore = getDimensions();
  window.addEventListener('resize', () => {
    if (translationDiv.style.display !== 'none' && textDirection == 'bottom') {
      updateDimensions(dimsBefore);
      dimsBefore = getDimensions();
    }
  });

  await createSettings(livetlContainer);

  let allUsersVal = (await isChecked('allUsers'));
  allTranslatorCheckbox.value = await createCheckbox('Automatically Detect', undefined,
    allUsersVal == null ? true : allUsersVal
    , false, async () => {
      // const boxes = document
      //   .querySelector('#transelectChecklist')
      //   .querySelectorAll('input:not(:checked)');
      // for (i = 0; i < boxes.length; i++) {
      //   // DO NOT CHANGE TO FOREACH
      //   box = boxes[i];
      //   box.checked = allTranslatorCheckbox.checked;
      //   box.saveStatus();
      // }
      checkboxUpdate();
    }
  );

  getJSON('customTags').then(obj => {
    Object.keys(obj).forEach(item => {
      displayTag(item, customTags[item].enabled);
    });
  });

  getJSON('customUsers').then(obj => {
    Object.keys(obj).forEach(async item => {
      displayName(item, (await getUserStatus(item, true)).checked);
    });
  });

  appendE = el => {
    dimsBefore = getDimensions();
    translationDiv.appendChild(el);
    updateDimensions(dimsBefore);
  };

  prependE = el => translationDiv.prepend(el);

  let prependOrAppend = e => (textDirection == 'bottom' ? appendE : prependE)(e);


  prependOrAppend(await createWelcome());
  const hrParent = document.createElement('div');
  const hr = document.createElement('hr');
  hrParent.className = 'line'; // so it properly gets inverted when changing the text direction
  hr.className = 'sepLine';
  hrParent.appendChild(hr);
  prependOrAppend(hrParent);

  window.onNewMessage = async messageInfo => {
    if (!messageInfo) return;

    // Determine whether we should display mod messages (if not set, default to yes)
    let displayModMessages = await getStorage('displayModMessages');
    if (displayModMessages == null) {
      displayModMessages = true;
      await setStorage('displayModMessages', true);
    }

    // Check to see if the sender is a mod, and we display mod messages
    if (messageInfo.author.types.includes(authorType.MOD) && displayModMessages) {
      // If the mod isn't in the sender list, add them
      if (await isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id,
          await getUserStatusAsBool(messageInfo.author.name));
      }
      checked = (await isChecked(messageInfo.author.id));
      // Check to make sure we haven't blacklisted the mod, and if not, send the message
      // After send the message, we bail so we don't have to run all the translation related things below
      if (checked) {
        let speechFuture = (async () => null)();
        if (!authorType.MOD) {
          //don't send caption if author is a mod #105
          sendToCaptions(messageInfo.message);
          speechFuture = checkAndSpeak(messageInfo.message);
        }
        prependOrAppend(createMessageEntry(messageInfo, messageInfo.message));
        await speechFuture;
        return;
      }
    }

    // Try to parse the message into a translation and get the language we're looking for translations in
    let translation = parseTranslation(messageInfo.message);
    let selectedLanguage = document.querySelector('#langSelect').value;

    // Make sure we parsed the message into a translation, and if so, check to see if it matches our desired language
    if (
      (
        translation == null &&
        Object.keys(customTags).some(key => {
          const res = customTags[key].enabled && messageInfo.message.includes(key);
          console.log(messageInfo.message, res);
          if (res) translation = { msg: messageInfo.message };
          return res;
        })
      ) ||
      (
        translation != null &&
        isLangMatch(translation.lang.toLowerCase(), languageConversionTable[selectedLanguage])
      )) {
      // If the author isn't in the senders list, add them
      if (await isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id,
          await getUserStatusAsBool(messageInfo.author.name));
      }

      checked = (await isChecked(messageInfo.author.id));
      // Check to see if the sender is approved, and send the message if they are
      if (checked) {
        let speechFuture = checkAndSpeak(translation.msg);
        sendToCaptions(translation.msg);
        prependOrAppend(createMessageEntry(messageInfo, translation.msg));
        await speechFuture;
        return;
      }
    }

    // if the user manually added this person
    if (await addedByUser(messageInfo.author.name)) {
      if (await isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id, true);
      }
      checked = (await isChecked(messageInfo.author.id));
      if (checked) {
        let speechFuture = checkAndSpeak(messageInfo.message);
        sendToCaptions(messageInfo.message);
        prependOrAppend(createMessageEntry(messageInfo, messageInfo.message));
        await speechFuture;
      }
      return;
    }
  };

  updateZoomLevel();

  if (isAndroid) {
    window.Android.getOrientation();
  }
}

async function reinsertButtons() {
  params = parseParams();
  if (params.embed_domain === 'hololive.jetri.co') {
    await insertLiveTLButtons(true);
    scrollBackToBottomOfChat();
  }
}

async function switchChat() {
  // let count = 2;
  // document.querySelectorAll('.yt-dropdown-menu').forEach((e) => {
  //   if (/Live chat/.exec(e.innerText) && count > 0) {
  //     e.click();
  //     count--;
  //   }
  // });
  // turned off chat switch for performance
}

function clearLiveTLButtons() {
  document.querySelectorAll('.liveTLBotan').forEach(b => b.remove());
}

getContinuation = (src) => {
  return parseParams('?' + src.split('?')[1]).continuation;
};

getV = (src) => {
  return parseParams('?' + src.split('?')[1]).v;
};


const createWindow = u => {
  chrome.runtime.sendMessage({ type: 'window', url: u });
};

let alreadyListening = false;

let sendToWindow = (data) => {
  try {
    chrome.runtime.sendMessage({ type: 'message', data: data, }, {});
  } catch (e) {
    console.debug(e);
  }
};

const redirectTab = u => {
  if (isAndroid) {
    window.Android.receiveMessage(u);
  } else {
    window.location.href = u;
  }
}

const createTab = u => window.open(u);
const getContinuationURL = (() => {
  let chatframe = document.querySelector('#chatframe');
  let cont = window.fetchedContinuationToken;
  if (chatframe) {
    cont = getContinuation(chatframe.dataset.src || chatframe.src)
  }
  return '&continuation=' + cont;
});

const getTitle = () => {
  const e = document.querySelector('#container > .title');
  return e ? encodeURIComponent(e.textContent) : '';
}

const restOfURL = () => `&title=${getTitle()}&useLiveTL=1${getContinuationURL()}&isReplay=${(hasReplayChatOpen() ? 1 : '')}&${Marine.holniParam()}`;

window.watchInLiveTL = async () => {
  params = parseParams();
  redirectTab(`${await getWAR('index.html')}?v=${params.v}${restOfURL()}`);
};

async function insertLiveTLButtons(isHolotools = false) {
  console.debug('Inserting LiveTL Launcher Buttons');
  clearLiveTLButtons();
  params = parseParams();
  const makeButton = (text, callback, color) => {
    let a = document.createElement('span');
    a.appendChild(getLiveTLButton(color));
    a.className = 'liveTLBotan';
    const e = isHolotools ? document.querySelector('#input-panel') : document.querySelector('ytd-live-chat-frame');
    e.appendChild(a);
    a.querySelector('a').addEventListener('click', callback);
    a.querySelector('yt-formatted-string').textContent = text;
    a.querySelector('yt-formatted-string').style.display = 'block';
  };

  var isReplay = hasReplayChatOpen()

  if (!isHolotools) {
    if (!(isSafari && isReplay)) {
      //Archives don't work in ltl view on safari
      makeButton('Watch in LiveTL', window.watchInLiveTL);
    }

    makeButton('Pop Out Translations',
      async () => {
        params = parseParams();
        createWindow(`${await getWAR('popout/index.html')}?v=${params.v}&mode=chat${restOfURL()}`);
        console.debug('Launched translation window for video', params.v);
        if (!alreadyListening) {
          alreadyListening = true;
          window.addEventListener('message', m => {
            if (typeof m.data == 'object') {
              switch (m.data.type) {
                case 'messageChunk':
                  sendToWindow(m.data);
                  console.debug('Sent', m.data, 'to', params.v);
                  break;
              }
            }
          });
        }
      },
      'rgb(143, 143, 143)');
  } else {
    makeButton('Expand Translations',
      async () => {
        params = parseParams();
        window.location.href = `${await getWAR('index.html')}?v=${params.v}&mode=chat&useLiveTL=1&noVideo=1`;
      });
  }
}

function isReplayChat() {
  return window.location.href.startsWith('https://www.youtube.com/live_chat_replay');
}

function hasReplayChatOpen() {
  const e = document.querySelector('#chatframe');
  return window.fetchedIsReplay != null ? fetchedIsReplay :
    e ? e.contentWindow.location.href.startsWith('https://www.youtube.com/live_chat_replay') : false;
}

function isLiveChat() {
  return window.location.href.startsWith('https://www.youtube.com/live_chat');
}

function isChat() {
  return isLiveChat() || isReplayChat();
}

function isVideo() {
  return window.location.href.startsWith('https://www.youtube.com/watch');
}

async function onMessageFromEmbeddedChat(m) {
  if (!isVideo()) {
    // I think this fixes the firefox no button issue
    // removeEventListener('message', onMessageFromEmbeddedChat);
    return;
  }
  if (typeof m.data == 'string') {
    switch (m.data) {
      case 'embeddedChatLoaded':
        let f = document.querySelector('#chatframe');
        f.dataset.src = f.contentWindow.location.href;
        await insertLiveTLButtons();
        if (isAndroid && isVideo()) {
          setInterval(async () => {
            window.watchInLiveTL();
          }, INTERVAL);
        }
        break;
      case 'clearLiveTLButtons':
        clearLiveTLButtons();
    }
  }
}

let params = {};
let lastLocation = '';

function injectScript(text) {
  let e = document.createElement("script");
  e.innerHTML = text;
  document.head.appendChild(e);
}

function isEmbed() {
  return window.location.href.startsWith('https://www.youtube.com/embed');
}


function monkeypatch() {
  window.oldFetch = window.oldFetch || window.fetch;
  function fetchLocalResource(url) {
    return new Promise((res, rej) => {
      const req = new XMLHttpRequest();
      req.onload = function () {
        const text = req.responseText;
        res(text);
      };
      req.open('GET', url);
      req.send();
    });
  }
  window.fetch = async (...args) => {
    try {
      let url = '';
      if (typeof args[0] == 'object') url = args[0].url;
      else url = args[0];
      if (url.startsWith('file:///android_asset')) {
        let text = await fetchLocalResource(url);
        return {
          json: async () => JSON.parse(text),
          text: async () => text
        };
      }
      let result = await window.oldFetch(...args);
      if (url.startsWith('https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')) {
        let data = await (await result.clone()).json();
        console.debug('Caught chunk', data);
        window.dispatchEvent(new CustomEvent('newMessageChunk', { detail: data }));
      }
      return result;
    } catch (e) {
      console.debug(e);
    }
  }
}

async function loaded() {
  // window.removeEventListener('load', loaded);
  // window.removeEventListener('yt-navigate-finish', loaded);
  // window.addEventListener('yt-navigate-finish', loaded);
  if (window.location.href == lastLocation) return;
  lastLocation = window.location.href;
  if (isChat()) {
    console.debug('Using live chat');
    try {
      params = parseParams();
      try {
        window.parent.postMessage({ type: 'getInitData' }, '*');
      } catch (e) { }
      if (params.useLiveTL) {
        console.debug('Running LiveTL!');
        runLiveTL();
      } else {
        console.debug('Monitoring network events');
        injectScript(monkeypatch.toString() + 'monkeypatch();');
        setTimeout(() => TranslatorMode.run(), 0)
        window.addEventListener('newMessageChunk', async (response) => {
          response = response.detail;
          response = JSON.parse(JSON.stringify(response));
          console.debug('newMessageChunk event received', response);
          let messages = [];
          if (!response.continuationContents) {
            console.debug('Response was invalid', response);
            return;
          }
          (response.continuationContents.liveChatContinuation.actions || []).forEach(action => {
            try {
              let currentElement = (action.addChatItemAction ||
                (action.replayChatItemAction != null ? action.replayChatItemAction.actions[0].addChatItemAction : null)
                || {}).item;
              if (!currentElement) return;
              let messageItem = currentElement.liveChatTextMessageRenderer;
              if (!messageItem) return;
              messageItem.authorBadges = messageItem.authorBadges || [];
              let authorTypes = [];
              messageItem.authorBadges.forEach(badge =>
                authorTypes.push(badge.liveChatAuthorBadgeRenderer.tooltip));
              let messageText = '';
              messageItem.message.runs.forEach(run => {
                if (run.text) messageText += run.text;
              });
              messageText = messageText.replace(invalidUnicode, '');
              if (!messageText) return;
              item = {
                author: {
                  name: messageItem.authorName.simpleText,
                  id: messageItem.authorExternalChannelId,
                  types: authorTypes
                },
                message: messageText,
                timestamp: isReplayChat() ? messageItem.timestampText.simpleText : parseTimestamp(messageItem.timestampUsec),
              };
              messages.push(item);
            } catch (e) {
              console.debug('Error while parsing message.', { e });
            }
          });
          let chunk = {
            type: 'messageChunk',
            messages: messages,
            video: getV(window.location.href) || getV(window.parent.location.href)
          };
          console.debug('Sending chunk', chunk);
          window.parent.postMessage(chunk, '*');
        });
      }
      if (params.embed_domain && !EMBED_DOMAIN.includes(params.embed_domain)) {
        await insertLiveTLButtons(true);
        scrollBackToBottomOfChat();
        document.querySelector('#view-selector').querySelectorAll('a').forEach(a => {
          a.addEventListener('click', reinsertButtons);
        });
        (new MutationObserver((data) => {
          if (data.length == 2) {
            reinsertButtons();
          }
        }).observe(document.querySelector('#view-selector').querySelector('#label-text'),
          { 'characterData': true, 'attributes': false, 'childList': false, 'subtree': true }));
      } else {
        window.parent.postMessage('embeddedChatLoaded', '*');
      }
      if (isAndroid) {
        document.querySelector('#input-panel').style.display = 'none';
      }
    } catch (e) {
      console.debug(e);
    }
  } else if (isEmbed()) {
    let initFullscreenButton = () => {
      let fsButton = document.querySelector('.ytp-fullscreen-button');
      fsButton.ariaDisabled = false;
      fsButton.addEventListener('click', () => {
        window.parent.postMessage({ type: 'fullscreen' }, '*');
      });
      document.querySelector('.ytp-youtube-button').style.display = 'none';
      document.querySelector('#movie_player>.ytp-generic-popup').style.opacity = '0';
      window.removeEventListener('mousedown', initFullscreenButton);
    };
    if (isFirefox) window.addEventListener('mousedown', initFullscreenButton);
    else initFullscreenButton();

    if (isAndroid) {
      setInterval(() => {
        // can't clear interval because youtube just randomly re-adds it
        let icon = document.querySelector('.iv-branding');
        if (icon) {
          icon.style.display = 'none';
        }
        let suggestions = document.querySelector('.ytp-pause-overlay');
        if (suggestions) {
          suggestions.style.display = 'none';
        }
      }, 100);
    }
  }

  if (isAndroid) {
    monkeypatch();
    if (!isVideo()) {
      window.hyperchatInjector = window.hyperchatInjector || await (await fetch(await getWAR('js/chat.js'))).text();
      const chatElem = document.querySelector('#chat');
      if (chatElem) {
        chatElem.contentWindow.eval(window.hyperchatInjector);
      }
      window.frameText = window.frameText || await (await fetch(await getWAR('js/frame.js'))).text();
      insertContentScript();
    }
    replaceLinks();
  }
}

function replaceLinks() {
  document.querySelectorAll('a').forEach(e => e.onclick = (event) => {
    window.Android.open(e.href);
    event.preventDefault();
  });
}

function parseTimestamp(timestamp) {
  return (new Date(parseInt(timestamp) / 1000)).toLocaleTimeString(navigator.language,
    { hour: '2-digit', minute: '2-digit' });
}

window.addEventListener('message', onMessageFromEmbeddedChat);
window.addEventListener('load', loaded);
window.addEventListener('yt-navigate-start', clearLiveTLButtons);

if ((isVideo() || isChat() || isEmbed()) && isFirefox) {
  window.dispatchEvent(new Event('load'));
}

const aboutPage = 'https://livetl.github.io/LiveTL/about/';

function setChatZoom(width, height, transform) {
  let e = document.querySelector('yt-live-chat-app');
  e.style.width = width;
  e.style.height = height;
  e.style.transformOrigin = '0 0';
  e.style.transform = transform;
  document.body.style.height = '100vh';
  document.body.style.width = '100vw';
}

if (window.location.href.startsWith(aboutPage)) {
  let replaceMessage = () => {
    const e = document.querySelector('#actionMessage');
    e.textContent = 'Thank you for installing LiveTL!';
  };
  window.addEventListener('load', replaceMessage);
  if (isAndroid) {
    replaceMessage();
    replaceLinks();
  }
} else if (window.location.href.startsWith('https://www.youtube.com/embed/')) {
  window.addEventListener('message', d => {
    try {
      parent.postMessage(d.data, '*');
    } catch (e) { }
  });
} else if (isChat()) {
  window.addEventListener('message', d => {
    if (d.data.type == 'zoom') {
      let z = d.data.zoom;
      setChatZoom(z.width, z.height, z.transform);
    }
    if (window.origin != d.origin) {
      postMessage(d.data);
    }
  });
  switchChat();
}
if (isLiveChat()) {
  window.addEventListener('message', d => {
    if (d.data.type === 'translatorMode') {
      TranslatorMode[d.data.fn]();
    }
    d = d.data;
    if (d['yt-player-video-progress']) {
      try {
        d.video = getV(window.parent.location.href);
        sendToWindow(d);
        // console.debug('Sent timestamp');
      } catch (e) { }
    }
  });
}

function wrapIconWithLink(icon, link) {
  const wrapper = document.createElement('a');
  wrapper.href = link;
  wrapper.target = 'about:blank';
  wrapper.appendChild(icon);
  return wrapper;
}

async function createLogo() {
  const a = document.createElement('a');
  a.href = 'https://livetl.github.io/LiveTL';
  a.target = 'about:blank';
  const logo = document.createElement('img');
  logo.className = 'logo';
  logo.src = await getWAR('icons/favicon.ico');
  a.appendChild(logo);
  return a;
}

function createIcon(faName, link, addSpace) {
  const icon = document.createElement('i');
  ['fa', 'smallIcon', faName].forEach(c => icon.classList.add(c));
  const wrapped = wrapIconWithLink(icon, link);
  return wrapped;
}

async function shareExtension(e) {
  const details = await getFile('manifest.json', 'json');
  if (navigator.share) {
    navigator.share({
      title: details.name,
      text: details.description,
      url: 'https://livetl.github.io/LiveTL'
    });
    e.preventDefault();
  }
}

async function createWelcomeText() {
  const welcomeText = document.createElement('span');
  welcomeText.textContent = 'Welcome to LiveTL! Translations picked up from the chat will appear here.';
  const buttons = document.createElement('div');
  buttons.classList.add('smallText');
  buttons.style.marginLeft = '0px';
  buttons.innerHTML = `
    Please consider
    <a id="shareExtension" href="https://livetl.github.io/LiveTL" target="about:blank">sharing LiveTL with your friends</a>,
    <a href="https://livetl.github.io/LiveTL/about/review" target="about:blank">giving us a 5-star review</a>,
    <a href="https://discord.gg/uJrV3tmthg" target="about:blank">joining our Discord server</a>,
    <a href="https://github.com/LiveTL/LiveTL" target="about:blank">starring our GitHub repository</a>, and 
    <a href="https://opencollective.com/livetl" target="about:blank">chipping in a few dollars to help fund future projects (stay tuned)</a>!
  `;
  welcomeText.appendChild(buttons);
  welcomeText.querySelector('#shareExtension').addEventListener('click', shareExtension);

  const versionInfo = document.createElement('div');
  versionInfo.classList.add('smallText');
  versionInfo.style.marginLeft = '0px';
  const details = await getFile('manifest.json', 'json');
  const update = await getFile('updateMessage.txt', 'text');
  versionInfo.innerHTML = `<strong>[NEW IN v${details.version}]:</strong> <span id='updateInfo'></span> `;
  versionInfo.querySelector('#updateInfo').textContent = update;
  const learnMore = document.createElement('a');
  learnMore.textContent = 'Learn More';
  learnMore.href = `https://livetl.github.io/LiveTL/changelogs?version=v${details.version}`;
  learnMore.target = 'about:blank';
  versionInfo.appendChild(learnMore);
  versionInfo.style.marginTop = '10px';
  welcomeText.appendChild(versionInfo);

  return welcomeText;
}

async function createWelcome() {
  const welcome = document.createElement('div');
  welcome.className = 'line';
  welcome.appendChild(await createLogo());
  welcome.appendChild(createIcon('fa-discord', 'https://discord.gg/uJrV3tmthg', false));
  welcome.appendChild(createIcon('fa-github', 'https://github.com/LiveTL/LiveTL', true));
  welcome.appendChild(await createWelcomeText());
  return welcome;
}

function getChecklist() {
  return document.querySelector('#transelectChecklist');
}

function getChecklistItems() {
  return getChecklist().querySelector('#items');
}

function createCheckmark(authorID, checked, addedByUser, onchange, customSave = false) {
  const checkmark = document.createElement('input');
  checkmark.type = 'checkbox';
  checkmark.dataset.id = authorID;
  checkmark.checked = checked;
  checkmark.addEventListener('change', onchange);
  checkmark.saveStatus = async () => {
    await saveUserStatus(checkmark.dataset.id, checkmark.checked, addedByUser);
    checkboxUpdate();
  };
  if(!customSave) checkmark.addEventListener('change', checkmark.saveStatus);
  return checkmark;
}

function createCheckboxPerson(name, authorID) {
  const person = document.createElement('label');
  person.setAttribute('for', authorID);
  person.textContent = name;
  return person;
}

async function createCheckbox(name, authorID = 'allUsers', checked = false, addedByUser = false, callback = null, customFilter = false) {
  const items = getChecklistItems();
  const checkbox = createCheckmark(authorID, checked, addedByUser, callback || checkboxUpdate);
  const selectTranslatorMessage = document.createElement('li');
  selectTranslatorMessage.appendChild(checkbox);
  let nameElement = createCheckboxPerson(name, authorID);
  if (authorID != 'allUsers') {
    const deleteButton = document.createElement('span');
    deleteButton.innerHTML = `<i class="fa fa-close" aria-hidden="true"></i>`;
    deleteButton.style.marginRight = '2px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.onclick = async () => {
      await resetUserStatus(authorID, customFilter);
      selectTranslatorMessage.remove();
    };
    selectTranslatorMessage.appendChild(deleteButton);
  }
  selectTranslatorMessage.appendChild(nameElement);
  selectTranslatorMessage.style.marginRight = '4px';
  items.appendChild(selectTranslatorMessage);
  let b = customFilter ? 'byName' : 'byID';
  await saveUserStatus(authorID, checked, addedByUser, customFilter);
  if (customFilter || authorID == 'allUsers') {
    nameElement.classList.add('italics');
    checkbox.dataset.customFilter = 'true';
  } else {
    allTranslators[b][authorID] = allTranslators[b][authorID] || {};
    allTranslators[b][authorID].checked = checked;
  }
  checkboxUpdate();
  return checkbox;
}

function filterBoxes(boxes) {
  boxes.forEach((box) => {
    if (box.dataset.customFilter) return;
    allTranslators.byID[box.dataset.id] = allTranslators.byID[box.dataset.id] || {};
    allTranslators.byID[box.dataset.id].checkbox = box;
    allTranslators.byID[box.dataset.id].checked = box.checked;
    // if (box !== allTranslatorCheckbox && !box.checked) {
    //   allTranslatorCheckbox.checked = false;
    // }
  });
}

function checkAll() {
  const boxes = getChecklist().querySelectorAll('input:not(:checked)');
  boxes.forEach(box => box.checked = true);
}

function removeBadTranslations() {
  document.querySelectorAll('.line').forEach((translation, i) => {
    const author = translation.querySelector('.smallText');
    if (author && author.dataset.id && !allTranslators.byID[author.dataset.id].checked) {
      translation.remove();
    }
  });
}

function checkboxUpdate() {
  const boxes = getChecklist().querySelectorAll('input');
  filterBoxes(boxes);
  // if (allTranslatorCheckbox.checked) {
  //   checkAll();
  // }
  removeBadTranslations();
}

function createTimestampElement(timestamp) {
  let timestampElement = document.createElement('span');
  timestampElement.textContent = ` (${timestamp})`;
  timestampElement.className = 'timestampText smallText';
  timestampElement.style.display = showTimestamps ? 'contents' : 'none';

  return timestampElement;
}

function createAuthorNameElement(messageInfo) {
  const authorName = document.createElement('span');
  authorName.textContent = ` ${messageInfo.author.name}`;
  authorName.dataset.id = messageInfo.author.id;
  authorName.className = `smallText ${messageInfo.author.types.join(' ').toLowerCase()}`;

  // capitalize the first letter
  const authorTypes = [];
  messageInfo.author.types.forEach(d => authorTypes.push(d.charAt(0).toUpperCase() + d.slice(1)));
  const type = authorTypes.join(', ');
  authorName.appendChild(createTooltip(type));

  return authorName;
}

function createTooltip(text) {
  const tooltip = document.createElement('span');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;

  return tooltip;
}

function createAuthorHideButton(translation) {
  const hide = document.createElement('span');
  hide.className = 'hasTooltip';
  hide.style.cursor = 'pointer';
  hide.addEventListener('click', () => translation.remove());

  hideSVG(hide);
  hide.appendChild(createTooltip('Hide Message'));

  return hide;
}

function createAuthorBanButton(authorID) {
  const ban = document.createElement('span');
  ban.className = 'hasTooltip';
  ban.style.cursor = 'pointer';
  ban.addEventListener('click', async () => {
    allTranslators.byID[authorID].checked = allTranslators.byID[authorID].checkbox.checked = false;
    // await saveUserStatus(authorID); checkbox already saves status onchange
    checkboxUpdate();
  });

  banSVG(ban);
  ban.appendChild(createTooltip('Blacklist User'));

  return ban;
}

function createAuthorInfoOptions(authorID, line) {
  const options = document.createElement('span');
  options.appendChild(createAuthorHideButton(line));
  options.appendChild(createAuthorBanButton(authorID));
  options.style.display = 'none';
  options.className = 'messageOptions';
  return options;
}

function createAuthorInfoElement(messageInfo, line) {
  const authorInfo = document.createElement('span');
  authorInfo.appendChild(createAuthorNameElement(messageInfo));
  authorInfo.appendChild(createTimestampElement(messageInfo.timestamp));
  authorInfo.appendChild(createAuthorInfoOptions(messageInfo.author.id, line));
  return authorInfo;
}

function setTranslationElementCallbacks(line) {
  line.addEventListener('mouseover', () => line.querySelector('.messageOptions').style.display = 'inline-block');
  line.addEventListener('mouseleave', () => line.querySelector('.messageOptions').style.display = 'none');
}

function createMessageEntry(messageInfo, message) {
  const line = document.createElement('div');
  line.className = 'line message';
  line.textContent = message;
  setTranslationElementCallbacks(line);
  line.appendChild(createAuthorInfoElement(messageInfo, line));
  return line;
}

function createSettingsProjection(add) {
  let settingsProjection = document.querySelector('#settingsProjection');
  if (settingsProjection) settingsProjection.remove();
  settingsProjection = document.createElement('div');
  settingsProjection.id = 'settingsProjection';
  settingsProjection.style.zIndex = -1;
  add(settingsProjection);
}

async function setFavicon() {
  const favicon = await getWAR('icons/favicon.ico');
  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/x-icon';
  faviconLink.href = await favicon;
  document.head.appendChild(faviconLink);
}

const sendToCaptions = caption => {
  const captionWindow = window.parent.parent;
  captionWindow.postMessage({ action: "caption", caption }, "*");
};

// MARK

function styleLiveTLButton(a, color) {
  a.style.backgroundColor = `${color || 'rgb(0, 153, 255)'}`;
  a.style.font = 'inherit';
  a.style.fontSize = '11px';
  a.style.fontWeight = 'bold';
  a.style.width = '100%';
  a.style.margin = 0;
  a.style.textAlign = 'center';
}

function setLiveTLButtonAttributes(a) {
  [
    'yt-simple-endpoint',
    'style-scope',
    'ytd-toggle-button-renderer'
  ].forEach(c => a.classList.add(c));
  a.tabindex = '-1';
}

function getLiveTLButton(color) {
  const a = document.createElement('a');
  setLiveTLButtonAttributes(a);
  styleLiveTLButton(a, color);
  a.innerHTML = `
        <paper-button id="button" class="style-scope ytd-toggle-button-renderer" role="button" tabindex="0" animated=""
            elevation="0" aria-disabled="false" style="
                padding: 5px;
                width: 100%;
                margin: 0;
            ">
            <yt-formatted-string id="text" class="style-scope ytd-toggle-button-renderer">
            </yt-formatted-string>
            <paper-ripple class="style-scope paper-button">
                <div id="background" class="style-scope paper-ripple" style="opacity: 0.00738;"></div>
                <div id="waves" class="style-scope paper-ripple"></div>
            </paper-ripple>
            <paper-ripple class="style-scope paper-button">
                <div id="background" class="style-scope paper-ripple" style="opacity: 0.007456;"></div>
                <div id="waves" class="style-scope paper-ripple"></div>
            </paper-ripple>
            <paper-ripple class="style-scope paper-button">
                <div id="background" class="style-scope paper-ripple" style="opacity: 0.007748;"></div>
                <div id="waves" class="style-scope paper-ripple"></div>
            </paper-ripple>
        </paper-button>
    `;
  return a;
}

async function insertContentScript() {
  document.querySelectorAll('iframe').forEach(async frame => {
    try {
      if (frame.id != 'livetl-chat' && !frame.contentWindow.runLiveTL) {
        frame.contentWindow.frameText = window.frameText;
        frame.contentWindow.hyperchatInjector = window.hyperchatInjector;
        frame.contentWindow.isAndroid = true;
        frame.contentWindow.eval(window.frameText);
        frame.contentWindow.loaded();
        frame.contentWindow.insertContentScript();
      }
    } catch (e) { console.debug(e) }
  });
}

if (isAndroid && isVideo()) {
  setInterval(() => {
    let chat = document.querySelector('#chatframe');
    if (chat && chat.src.startsWith('https://www.youtube.com/live_chat')) {
      window.postMessage('embeddedChatLoaded');
    }
  }, INTERVAL);
}

module.exports = { isAndroid, parseParams };
