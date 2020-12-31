const isFirefox = !!/Firefox/.exec(navigator.userAgent);

window.isAndroid = window.isAndroid || (window.chrome == null && !isFirefox);

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

const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));


const embedDomain = EMBED_DOMAIN;

const allTranslators = { byID: {}, byName: {} };
// byName is unused, always checking from storage
let allTranslatorCheckbox = {};
let showTimestamps = true;
let textDirection = 'bottom';
let mostRecentTimestamp = 0;

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
  document.title = decodeURIComponent(params.title) || 'LiveTL Chat';

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
  allTranslatorCheckbox = await createCheckbox('Automatically Detect', undefined,
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
        if (!authorType.MOD) {
          //don't send caption if author is a mod #105
          sendToCaptions(messageInfo.message);
        }
        prependOrAppend(createMessageEntry(messageInfo, messageInfo.message));
        return;
      }
    }

    // Try to parse the message into a translation and get the language we're looking for translations in
    const translation = parseTranslation(messageInfo.message);
    const selectedLanguage = document.querySelector('#langSelect').value;

    // Make sure we parsed the message into a translation, and if so, check to see if it matches our desired language
    if (
      translation != null &&
      isLangMatch(translation.lang.toLowerCase(), languageConversionTable[selectedLanguage])) {
      // If the author isn't in the senders list, add them
      if (await isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id,
          await getUserStatusAsBool(messageInfo.author.name));
      }

      checked = (await isChecked(messageInfo.author.id));
      // Check to see if the sender is approved, and send the message if they are
      if (checked) {
        sendToCaptions(translation.msg);
        prependOrAppend(createMessageEntry(messageInfo, translation.msg));
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
        sendToCaptions(messageInfo.message);
        prependOrAppend(createMessageEntry(messageInfo, messageInfo.message));
      }
      return;
    }
  };

  updateZoomLevel();
}

async function reinsertButtons() {
  params = parseParams();
  if (params.embed_domain === 'hololive.jetri.co') {
    await insertLiveTLButtons(true);
    scrollBackToBottomOfChat();
  }
}

async function switchChat() {
  let count = 2;
  document.querySelectorAll('.yt-dropdown-menu').forEach((e) => {
    if (/Live chat/.exec(e.innerText) && count > 0) {
      e.click();
      count--;
    }
  });
}

function parseParams(loc) {
  const s = decodeURI((loc || location.search).substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"');
  return s === '' ? {} : JSON.parse('{"' + s + '"}');
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


const createWindow = async u => {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type: 'window', url: u }, (d, a) => {
      res(d);
    });
  });
};

let alreadyListening = false;

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
  };

  const redirectTab = u => {
    if (isAndroid) {
      window.Android.receiveMessage(u);
    } else {
      window.location.href = u;
    }
  }
  const createTab = u => window.open(u);
  getContinuationURL = (() => {
    let chatframe = document.querySelector('#chatframe');
    let src = chatframe.dataset.src || chatframe.src;
    return '&continuation=' + getContinuation(src);
  });

  getTitle = () => encodeURIComponent(document.querySelector('#container > .title').textContent);

  restOfURL = () => `&title=${getTitle()}&useLiveTL=1${getContinuationURL()}&isReplay=${(hasReplayChatOpen() ? 1 : '')}`;

  window.watchInLiveTL = async () => {
    params = parseParams();
    redirectTab(`${await getWAR('index.html')}?v=${params.v}${restOfURL()}`);
  };

  if (!isHolotools) {
    makeButton('Watch in LiveTL', window.watchInLiveTL);

    sendToWindow = (data) => {
      try {
        chrome.runtime.sendMessage({ type: 'message', data: data }, {});
      } catch (e) {
        console.debug(e);
      }
    };

    makeButton('Pop Out Translations',
      async () => {
        params = parseParams();
        await createWindow(`${await getWAR('popout/index.html')}?v=${params.v}&mode=chat${restOfURL()}`);
        document.querySelector('#chatframe').contentWindow.addEventListener('message', d => {
          d = d.data['yt-player-video-progress'];
          if (d) {
            mostRecentTimestamp = d;
          }
        });
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
  return document.querySelector('#chatframe').contentWindow.location.href.startsWith('https://www.youtube.com/live_chat_replay');
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
          }, 0);
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
      if (params.embed_domain === 'hololive.jetri.co') {
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
    document.querySelector('.iv-branding').style.display='none';
    let initFullscreenButton = () => {
      document.querySelector('.ytp-fullscreen-button').addEventListener('click', () => {
        window.parent.postMessage({ type: 'fullscreen' }, '*');
      });
      document.querySelector('#movie_player>.ytp-generic-popup').style.opacity = '0';
      window.removeEventListener('mousedown', initFullscreenButton);
    };
    if (isFirefox) window.addEventListener('mousedown', initFullscreenButton);
    else initFullscreenButton();
  }

  if (isAndroid) {
    monkeypatch();
    if (!isVideo()) {
      window.frameText = window.frameText || await (await fetch(await getWAR('js/frame.js'))).text();
      insertContentScript();
    }
    document.querySelectorAll('a').forEach(e => e.onclick = () => window.Android.open(e.href));
  }
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

const aboutPage = 'https://kentonishi.github.io/LiveTL/about/';

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
  window.addEventListener('load', () => {
    const e = document.querySelector('#actionMessage');
    e.textContent = 'Thank you for installing LiveTL!';
  });
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

function wrapIconWithLink(icon, link) {
  const wrapper = document.createElement('a');
  wrapper.href = link;
  wrapper.target = 'about:blank';
  wrapper.appendChild(icon);
  return wrapper;
}

async function createLogo() {
  const a = document.createElement('a');
  a.href = aboutPage;
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
      url: 'https://kentonishi.github.io/LiveTL'
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
    <a id="shareExtension" href="https://kentonishi.github.io/LiveTL" target="about:blank">sharing LiveTL with your friends</a>, 
    <a href="https://kentonishi.github.io/LiveTL/about/review" target="about:blank">giving us a 5-star review</a>, 
    <a href="https://discord.gg/uJrV3tmthg" target="about:blank">joining our Discord server</a>, and
    <a href="https://github.com/KentoNishi/LiveTL" target="about:blank">starring our GitHub repository</a>!
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
  learnMore.href = `https://kentonishi.github.io/LiveTL/changelogs?version=v${details.version}`;
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
  welcome.appendChild(createIcon('fa-github', 'https://github.com/KentoNishi/LiveTL', true));
  welcome.appendChild(await createWelcomeText());
  return welcome;
}

function getChecklist() {
  return document.querySelector('#transelectChecklist');
}

function getChecklistItems() {
  return getChecklist().querySelector('#items');
}

function createCheckmark(authorID, checked, addedByUser, onchange) {
  const checkmark = document.createElement('input');
  checkmark.type = 'checkbox';
  checkmark.dataset.id = authorID;
  checkmark.checked = checked;
  checkmark.addEventListener('change', onchange);
  checkmark.saveStatus = async () => {
    await saveUserStatus(checkmark.dataset.id, checkmark.checked, addedByUser);
    checkboxUpdate();
  };
  checkmark.addEventListener('change', checkmark.saveStatus);
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
  authorName.textContent = `${messageInfo.author.name}`;
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
  const favicon = getWAR('icons/favicon.ico');
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
  }, 0);
}