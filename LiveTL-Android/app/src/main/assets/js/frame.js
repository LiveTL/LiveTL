const languages = [
  { code: 'en', name: 'English', lang: 'English' },
  { code: 'jp', name: 'Japanese', lang: '日本語' },
  { code: 'es', name: 'Spanish', lang: 'Español' },
  { code: 'id', name: 'Indonesian', lang: 'bahasa Indonesia' },
  { code: 'kr', name: 'Korean', lang: '한국' },
  { code: 'ch', name: 'Chinese', lang: '中文' },
  { code: 'ru', name: 'Russian', lang: 'русский' }
];

const languageConversionTable = {};

// WAR: web accessible resource
async function getWAR(u) {
  return new Promise((res, rej) => chrome.runtime.sendMessage({ type: 'get_war', url: u }, r => res(r)));
}

async function getFile(name, format) {
  return await (await fetch(await getWAR(name)))[format]();
}

const isFirefox = !!/Firefox/.exec(navigator.userAgent);
const isAndroid = !!/Android/.exec(navigator.userAgent);

const embedDomain = "https://cranky-beaver-1d73c7.netlify.app/embed";

const allTranslators = { byID: {}, byName: {} };
// byName is unused, always checking from storage
let allTranslatorCheckbox = {};
let showTimestamps = true;
let textDirection = 'bottom';
let mostRecentTimestamp = 0;

async function addedByUser(id) {
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

    /********************************************
     * TODO FIXME Messages need to be displayed at the appropriate time in the video, not whenever we receive them.
     ********************************************/

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
        sendToCaptions(messageInfo.message);
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

  const redirectTab = u => window.location.href = u;
  const createTab = u => window.open(u);
  getContinuationURL = (() => {
    let chatframe = document.querySelector('#chatframe');
    let src = chatframe.dataset.src;
    return '&continuation=' + getContinuation(chatframe.dataset.src);
  });

  getTitle = () => encodeURIComponent(document.querySelector('#container > .title').textContent);

  restOfURL = () => `&title=${getTitle()}&useLiveTL=1${getContinuationURL()}&isReplay=${(hasReplayChatOpen() ? 1 : '')}`;

  if (!isHolotools) {
    makeButton('Watch in LiveTL', async () => {
      params = parseParams();
      redirectTab(`${await getWAR('index.html')}?v=${params.v}${restOfURL()}`);
    });

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
      if (params.useLiveTL) {
        console.debug('Running LiveTL!');
        runLiveTL();
      } else {
        console.debug('Monitoring network events');
        injectScript(`
          window.oldFetch = window.oldFetch || window.fetch;
          window.fetch = async (...args) => {
            try {
              let result = await window.oldFetch(...args);
              if (args[0].url.startsWith('https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')) {
                let data = await (await result.clone()).json();
                console.debug('Caught chunk', data);
                window.dispatchEvent(new CustomEvent('newMessageChunk', { detail: data }));
              }
              return result;
            } catch(e) {
              console.debug(e);
            }
          }
        `);
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
                timestamp: isReplayChat() ? messageItem.timestampText.simpleText : parseTimestamp(messageItem.timestampUsec)
              };
              messages.push(item);
            } catch (e) {
              console.debug('Error while parsing message.', { e });
            }
          });
          let chunk = {
            type: 'messageChunk',
            messages: messages,
            videoTimestamp: mostRecentTimestamp,
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
    } catch (e) {
      console.debug(e);
    }
  } else if (isEmbed()) {
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


async function isNewUser(id) {
  return allTranslators.byID[id] == null;
}

async function isChecked(userid) {
  return (await getUserStatus(userid)).checked;
}

async function saveUserStatus(userid, checked, addedByUser, byname) {
  return await setStorage(`user${(byname ? 'byname' : '')}_${userid}`, { checked, addedByUser });
}

async function getUserStatus(userid, byname) {
  return (await getStorage(`user${(byname ? 'byname' : '')}_${userid}`)) || {};
}

async function getUserStatusAsBool(id) {
  let status = await getUserStatus(id);
  status = status.checked != null ? status.checked : allTranslatorCheckbox.checked;
  return status;
}

async function getDefaultLanguage() {
  let lang = await getStorage('LTL:defaultLang');
  if (lang) {
    return lang.lang;
  }
}

async function setDefaultLanguage(lang) {
  return await setStorage('LTL:defaultLang', { lang });
}

async function setupDefaultCaption() {
  if ((await getStorage('captionMode')) == null) {
    return await setStorage('captionMode', true);
  }
};

async function getStorage(key) {
  const result = await storage.get(key);
  return result ? result[key] : result;
}

async function setStorage(key, value) {
  let obj = {}
  obj[key] = value;
  return await storage.set(obj);
}

let storage = {
  get: key => null,
  set: obj => null
};

if (isFirefox) {
  storage.get = async (key) => {
    return await browser.storage.local.get(key);
  };

  storage.set = async (obj) => {
    return await browser.storage.local.set(obj);
  };
} else if (isAndroid) {
  storage.get = async key => localStorage[key];
  storage.set = async obj => localStorage[Object.keys(obj)[0]] = obj[Object.keys(obj)[0]];
} else {
  storage.get = (key) => {
    return new Promise((res, rej) => {
      chrome.storage.local.get(key, res)
    });
  };

  storage.set = (obj) => {
    return new Promise((res, rej) => {
      chrome.storage.local.set(obj, res);
    })
  };
}

const MAX_LANG_TAG_LEN = 7;

const langTokens = [['[', ']'], ['{', '}'], ['(', ')'], ['|', '|'], ['<', '>'], ['【', '】'], ['「', '」'], ['『', '』'], ['〚', '〛'], ['（', '）'], ['〈', '〉'], ['⁽', '₎']];
const startLangTokens = langTokens.flatMap(e => e[0]);
const tokenMap = Object.fromEntries(langTokens);

const transDelimiters = ['-', ':'];
const langSplitRe = /[^A-Za-z]/;
// const langSplitRe = /[^A-Za-z\/\ \-\:\.\|\／]/;
/**
 * Parses translation
 *
 * @param message the message to parse
 * @return undefined or
 * {
 *    lang: lang code
 *    msg: message
 * }
 */
const parseTranslation = message => {
  const trimmed = message.trim();

  // try bracket trans blocks first - '[lang]', '[lang] -'
  const leftToken = trimmed[0];
  const rightToken = tokenMap[leftToken];

  const righTokenIndex = trimmed.indexOf(rightToken);

  if (righTokenIndex !== -1) {
    const startsWithLeftToken = startLangTokens.includes(trimmed[0]);

    if (startsWithLeftToken) {
      const lang = trimmed.slice(1, righTokenIndex);
      let msg = trimmed.slice(righTokenIndex + 1).trim();

      // remove potential trailing dash
      if (msg[0] === '-' || msg[0] === ':') {
        msg = msg.slice(1).trim();
      }

      return {
        lang,
        msg
      };
    }
  }

  // try all delims
  for (const delim of transDelimiters) {
    const idx = trimmed.indexOf(delim);

    if (idx !== -1 && idx < MAX_LANG_TAG_LEN) {
      const lang = trimmed.slice(0, idx).trim().replace(/\W/g, '');
      const msg = trimmed.slice(idx + 1).trim();

      return {
        lang,
        msg
      };
    }
  }

  return undefined;
};

function isLangMatch(textLang, currentLang) {
  textLang = textLang.toLowerCase().split(langSplitRe).filter(s => s !== '');
  return textLang.length <= 2 && textLang.some(s => (
    currentLang.name.toLowerCase().startsWith(s) ||
    s === currentLang.code ||
    currentLang.lang.toLowerCase().startsWith(s)
  ));
}

/**
 * Dependencies:
 *
 * constants.js
 * css.js
 * storage.js
 * svgs.js
 *
 * Other:
 *
 * needs languageConversionTable = {} declared before this module
 */

const enableDarkModeToggle = false;

async function createSettings(container) {
  const settings = createModal(container);
  settings.appendChild(createLanguageSelect());
  settings.appendChild(createTranslatorSelect());
  settings.appendChild(createCustomUserButton(container));
  settings.appendChild(await createDisplayModMessageToggle());
  settings.appendChild(await createZoomSlider());
  settings.appendChild(await createTimestampToggle());
  settings.appendChild(await createTextDirectionToggle(container));
  settings.appendChild(await createChatSideToggle());
  settings.appendChild(await createCaptionDisplayToggle());

  await updateZoomLevel();
  return settings;
}

function createModal(container) {
  const settingsButton = document.createElement('div');
  settingsGear(settingsButton);
  settingsButton.id = 'settingsGear';
  settingsButton.style.zIndex = 1000000;
  settingsButton.style.padding = '5px';
  settingsButton.style.width = '24px';

  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal';
  modalContainer.style.zIndex = 1000000;
  modalContainer.style.width = 'calc(100% - 20px);';
  modalContainer.style.display = 'none';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const nextStyle = {
    contents: 'none',
    none: 'contents'
  };

  const icon = {
    contents: closeSVG,
    none: settingsGear
  };

  settingsButton.addEventListener('click', async (e) => {
    if (container.style.display == 'none') {
      closeMessageSelector(container);
      return;
    }
    const newDisplay = nextStyle[modalContainer.style.display];
    modalContainer.style.display = newDisplay;
    icon[newDisplay](settingsButton);
    if (newDisplay === 'none') {
      document.querySelector('.translationText').style.display = 'block';
      modalContainer.style.height = 'auto';
      window.updateDimensions(null, true, textDirection == 'top');
    } else {
      document.querySelector('.translationText').style.display = 'none';
    }

    if (enableDarkModeToggle) {
      let previousTheme = await getStorage('theme');
      let themeToggle = document.querySelector('#darkThemeToggle');
      if (themeToggle.value != previousTheme) {
        let dark = themeToggle.value == 'dark' ? 1 : 0;
        await setStorage('theme', themeToggle.value);
        window.parent.postMessage({ type: 'themeChange', 'darkTheme': dark }, '*');
        changeThemeAndRedirect(dark);
      }
    }
  });

  modalContainer.appendChild(modalContent);

  document.body.appendChild(settingsButton);
  container.appendChild(modalContainer);

  return modalContent;
}

function setSelectInputCallbacks(select, defaultValue) {
  select.addEventListener('focus', () => select.value = '');
  const updateSelect = async () => {
    if (!(select.value in languageConversionTable)) {
      select.value = defaultValue;
    }
    await setDefaultLanguage(select.value);
    await getDefaultLanguage();
  };
  select.addEventListener('blur', updateSelect);
  select.addEventListener('change', updateSelect);
}

function createLangSelectionName(lang) {
  return `${lang.name} (${lang.lang})`;
}

function createLangSelectOption(lang) {
  const opt = document.createElement('option');
  opt.value = createLangSelectionName(lang);
  return opt;
}

languages.forEach(i => languageConversionTable[createLangSelectionName(i)] = i);

function createLangSelectLabel() {
  const langSelectLabel = document.createElement('span');
  langSelectLabel.className = 'optionLabel';
  langSelectLabel.textContent = 'Language: ';
  return langSelectLabel;
}

function createSelectInput() {
  const select = document.createElement('input');
  select.dataset.role = 'none';
  select.setAttribute('list', 'languages');
  select.setAttribute('autocomplete', 'off');
  select.id = 'langSelect';
  getDefaultLanguage().then(defaultLang => {
    select.value = defaultLang || createLangSelectionName(languages[0]);
    setSelectInputCallbacks(select, select.value);
  });
  return select;
}

function createLangSelectDatalist() {
  const datalist = document.createElement('datalist');
  datalist.id = 'languages';
  const appendDatalist = e => datalist.appendChild(e);
  languages.map(createLangSelectOption).map(appendDatalist);
  return datalist;
}

function createLanguageSelect() {
  const langSelectContainer = document.createElement('div');
  langSelectContainer.appendChild(createLangSelectLabel());
  langSelectContainer.appendChild(createSelectInput());
  langSelectContainer.appendChild(createLangSelectDatalist());
  return langSelectContainer;
}

function setChecklistOnclick(checklist) {
  checklist.querySelector('.anchor').addEventListener('click', () => {
    const items = checklist.querySelector('#items');
    if (items.style.display !== 'block') {
      checklist.classList.add('openList');
      items.style.display = 'block';
    } else {
      checklist.classList.remove('openList');
      items.style.display = 'none';
    }
  });
  ;
}

function setChecklistOnblur(checklist) {
  checklist.addEventListener('blur', e => {
    const items = checklist.querySelector('#items');
    if (!e.currentTarget.contains(e.relatedTarget)) {
      checklist.classList.remove('openList');
      items.style.display = 'none';
    } else e.currentTarget.focus();
  });
}

function setChecklistCallbacks(checklist) {
  setChecklistOnclick(checklist);
  setChecklistOnblur(checklist);
}

function createTranslatorSelect() {
  const translatorSelectContainer = document.createElement('div');
  translatorSelectContainer.appendChild(createTransSelectLabel());
  translatorSelectContainer.appendChild(createTransSelectChecklist());
  return translatorSelectContainer;
}

function createTransSelectDefaultText() {
  const defaultText = document.createElement('span');
  defaultText.className = 'anchor';
  defaultText.textContent = 'View All';
  return defaultText;
}

function createTransSelectChecklistItems() {
  const items = document.createElement('ul');
  items.id = 'items';
  items.className = 'items';
  return items;
}

function createTransSelectLabel() {
  const translatorSelectLabel = document.createElement('span');
  translatorSelectLabel.className = 'optionLabel';
  translatorSelectLabel.innerHTML = 'User Filter:&nbsp';
  return translatorSelectLabel;
}

function createTransSelectChecklist() {
  const checklist = document.createElement('div');
  checklist.className = 'dropdown-check-list';
  checklist.id = 'transelectChecklist';
  checklist.tabIndex = 1;
  checklist.appendChild(createTransSelectDefaultText());
  checklist.appendChild(createTransSelectChecklistItems());
  checklist.style.border = '1px solid gray';
  setChecklistCallbacks(checklist);
  return checklist;
}

function createZoomLabel() {
  const label = document.createElement('span');
  label.className = 'optionLabel';
  label.textContent = 'Zoom: ';
  return label;
}

const zoomSliderInputId = 'zoomSliderInput';

async function createZoomSliderInput() {
  let zoomSlider = document.createElement('input');
  zoomSlider.id = zoomSliderInputId;
  zoomSlider.type = 'range';
  zoomSlider.min = '0.5';
  zoomSlider.max = '2';
  zoomSlider.style.padding = '4px';
  zoomSlider.step = '0.01';
  zoomSlider.value = ((await getStorage('zoom')) || 1);
  zoomSlider.style.verticalAlign = 'middle';
  zoomSlider.addEventListener('change', () => updateZoomLevel());

  return zoomSlider;
}

async function updateZoomLevel() {
  let value = parseFloat(document.getElementById(zoomSliderInputId).value) || await getStorage('zoom') || 1;
  let scale = Math.ceil(value * 100);
  let container = document.body;// document.querySelector('.bodyWrapper');
  container.style.transformOrigin = '0 0';
  container.style.transform = `scale(${scale / 100})`;
  let inverse = 10000 / scale;
  container.style.width = `${inverse}%`;
  container.style.height = `${inverse}%`;
  await setStorage('zoom', scale / 100);
}

function createZoomResetButton() {
  let resetButton = document.createElement('input');
  resetButton.value = 'Reset';
  resetButton.style.marginLeft = '4px';
  resetButton.style.verticalAlign = 'middle';
  resetButton.type = 'button';
  resetButton.addEventListener('click', async () => {
    document.getElementById(zoomSliderInputId).value = 1;
    await updateZoomLevel();
  });

  return resetButton;
}

async function createZoomSlider() {
  const zoomSettings = document.createElement('div');
  const zoomSliderInput = await createZoomSliderInput();

  zoomSettings.appendChild(createZoomLabel());
  zoomSettings.appendChild(zoomSliderInput);
  zoomSettings.appendChild(createZoomResetButton());

  return zoomSettings;
}

function createTimestampLabel() {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.htmlFor = 'timestampToggle';
  label.textContent = 'Show Timestamps: ';

  return label;
}

async function createTimestampCheckbox() {
  let timestampToggle = document.createElement('input');
  timestampToggle.id = 'timestampToggle';
  timestampToggle.type = 'checkbox';
  timestampToggle.style.padding = '4px';
  timestampToggle.style.verticalAlign = 'middle';

  let display = await getStorage('timestamp');
  display = display != null ? display : true;
  timestampToggle.checked = display;

  let changed = async () => {
    showTimestamps = timestampToggle.checked;
    await setStorage('timestamp', showTimestamps);
    document.querySelectorAll('.timestampText').forEach(m => m.style.display = showTimestamps ? 'contents' : 'none');
  };

  timestampToggle.addEventListener('change', changed);

  await changed();

  return timestampToggle;
}

async function createTimestampToggle() {
  const timestampSettings = document.createElement('div');
  timestampSettings.appendChild(createTimestampLabel());
  timestampSettings.appendChild(await createTimestampCheckbox());
  return timestampSettings;
}

function createTextDirectionLabel() {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.htmlFor = 'textDirToggle';
  label.textContent = 'Text Direction: ';

  return label;
}

async function createTextDirectionSelect() {
  let textDirSelect = document.createElement('select');
  textDirSelect.innerHTML = `
    <option id="top" value="top">Top</option>
    <option id="bottom" value="bottom">Bottom</option>
  `;

  let data = (await getStorage('text_direction'));
  data = (data == null ? 'bottom' : data);
  textDirSelect.value = textDirection = data;

  let changed = async () => {
    textDirection = textDirSelect.value;
    await setStorage('text_direction', textDirection);
    let tt = document.querySelector('.translationText');
    let sg = document.querySelector('#settingsGear');
    tt.querySelectorAll('.line').forEach(m => prependE(m));
    if (textDirection === 'top') {
      tt.style.maxHeight = null;
      tt.style.position = null;
      tt.style.bottom = null;
      sg.style.bottom = '5px';
      sg.style.top = null;
    } else {
      tt.style.maxHeight = '100%';
      tt.style.position = 'absolute';
      tt.style.bottom = '0';
      sg.style.top = '5px';
      sg.style.bottom = null;
    }
  };

  textDirSelect.addEventListener('change', changed);

  await changed();
  return textDirSelect;
}

async function createTextDirectionToggle(container) {
  const textDirToggle = document.createElement('div');
  textDirToggle.appendChild(createTextDirectionLabel());
  textDirToggle.appendChild(await createTextDirectionSelect(container));
  textDirToggle.style.marginTop = '10px';
  return textDirToggle;
}

function createChatSideLabel() {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.textContent = 'Chat side: ';

  return label;
}

async function createChatSideRadios() {
  const left = document.createElement('input');
  const right = document.createElement('input');

  left.id = 'chatSideLeft';
  right.id = 'chatSideRight';

  left.type = right.type = 'radio';
  left.name = right.name = 'chatSide';

  const side = await getStorage('chatSide');

  if (side === 'right') {
    right.checked = true;
  } else if (side === 'left') {
    left.checked = true;
  } else {
    right.checked = true;
  }

  const onChange = async () => {
    const videoPanel = parent.document.getElementById('videoPanel');
    const liveTlPanel = parent.document.getElementById('ltlPanel');

    if (right.checked === true) {
      await setStorage('chatSide', 'right');

      videoPanel.style.order = '1';
      liveTlPanel.style.order = '3';
    } else if (left.checked === true) {
      await setStorage('chatSide', 'left');

      videoPanel.style.order = '3';
      liveTlPanel.style.order = '1';
    }
  };

  left.addEventListener('change', onChange);
  right.addEventListener('change', onChange);

  return { left, right };
}

function createChatSideRadioLabels() {
  const left = document.createElement('label');
  const right = document.createElement('label');

  left.htmlFor = 'chatSideLeft';
  right.htmlFor = 'chatSideRight';

  left.textContent = 'Left';
  right.textContent = 'Right';

  return { left, right };
}

async function createChatSideToggle() {
  const chatSideToggle = document.createElement('div');
  chatSideToggle.appendChild(createChatSideLabel());

  const radios = await createChatSideRadios();
  const labels = createChatSideRadioLabels();

  chatSideToggle.appendChild(radios.left);
  chatSideToggle.appendChild(labels.left);
  chatSideToggle.appendChild(radios.right);
  chatSideToggle.appendChild(labels.right);

  return chatSideToggle;
}

function createCheckToggleLabel(labelName, labelFor) {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.htmlFor = labelFor;
  label.textContent = labelName;
  return label;
}

async function createCheckToggleCheckbox(id, storageName, onchange) {
  const checkbox = document.createElement('input');
  checkbox.id = id;
  checkbox.type = 'checkbox';
  checkbox.style.padding = '4px';
  checkbox.style.verticalAlign = 'middle';

  let display = await getStorage(storageName);
  checkbox.checked = display != null ? display : true;

  const changed = async() => {
    const toDisplay = checkbox.checked;
    await setStorage(storageName, toDisplay);
    await onchange();
  };

  checkbox.addEventListener('change', changed);

  await changed();

  return checkbox;
}

function createDisplayModMessageLabel() {
  return createCheckToggleLabel('Show Mod Messages: ', 'displayModMessages');
}

async function createDisplayModMessageCheckbox() {
  return await createCheckToggleCheckbox(
    'displayModMessages', 'displayModMessages', async () => {
      const displayModMessages = await getStorage('displayModMessages');
      document.querySelectorAll('.mod').forEach(el => {
        el.parentElement
          .parentElement
          .style
          .display = displayModMessages ? 'block': 'none';
      });
    }
  );
}

async function createDisplayModMessageToggle() {
  const displayModMessagesToggle = document.createElement('div');
  displayModMessagesToggle.appendChild(createDisplayModMessageLabel());
  displayModMessagesToggle.appendChild(await createDisplayModMessageCheckbox());

  return displayModMessagesToggle;
}

function changeThemeAndRedirect(dark) {
  var url = new URL(location.href);
  url.searchParams.set('dark_theme', dark);
  location.href = url.toString();
}

function closeMessageSelector(container) {
  container.style.display = null;
  document.querySelector('#chat').style.cursor = null;
  document.querySelector('#settingsGear').classList.remove('pickUserDoneBtn');
  scrollBackToBottomOfChat();
}

function findParent(e) {
  while (e && e.tagName != 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') e = e.parentElement;
  return e;
}

function scrollBackToBottomOfChat() {
  document.querySelector('#show-more').dispatchEvent(new Event('click'));
}

function createCustomUserButton(container) {
  let addButton = document.createElement('input');
  addButton.value = 'Add User to Filter';
  addButton.style.verticalAlign = 'middle';
  addButton.type = 'button';
  addButton.addEventListener('click', async () => {
    let name = prompt('Enter a username:');
    if (name) {
      await saveUserStatus(name, true, undefined, true);
      await createCheckbox(`(Custom) ${name}`, name, true, undefined, async (e) => {
        await saveUserStatus(name, e.target.checked, undefined, true);
      }, true);
    }
  });
  return addButton;
}

async function createCaptionDisplayToggle() {
  await setupDefaultCaption();
  const captionDispToggle = document.createElement('div');
  captionDispToggle.appendChild(createCaptionDisplayToggleLabel());
  captionDispToggle.appendChild(await createCaptionDisplayToggleCheckbox());
  return captionDispToggle;
}

function createCaptionDisplayToggleLabel() {
  return createCheckToggleLabel('Caption mode (beta)', 'captionMode');
}

async function createCaptionDisplayToggleCheckbox() {
  return await createCheckToggleCheckbox(
    'captionMode', 'captionMode', async () => {
      const postMessage = window.parent.parent.postMessage;
      if ((await getStorage('captionMode'))) {
        postMessage({
          action: 'caption',
          caption: 'Captions will appear here. Use your mouse to move and resize!'
        });
      } else {
        postMessage({ action: 'clearCaption' }, '*');
      }
    }
  );
}
/**
 * Dependencies
 *
 * constants.js
 */

async function importFontAwesome() {
  document.head.innerHTML += `
    <link 
     rel="stylesheet"
     href="https://cdn.jsdelivr.net/npm/fork-awesome@1.1.7/css/fork-awesome.min.css"
     integrity="sha256-gsmEoJAws/Kd3CjuOQzLie5Q3yshhvmo7YNtBG7aaEY="
     crossorigin="anonymous">
        `;
}

async function importCSS(url) {
  const frameCSSURL = getWAR(url);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = await frameCSSURL;
  link.type = 'text/css';
  document.head.appendChild(link);
}

async function importStyle() {
  return await importCSS('css/frame.css');
}
function closeSVG (e) {
  e.innerHTML = '<svg class="svgButton" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
}

function hideSVG (e) {
  e.innerHTML = ' <svg class="hide" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 572.098 572.098" style="enable-background:new 0 0 572.098 572.098;" xml:space="preserve"> <g> <path d="M99.187,398.999l44.333-44.332c-24.89-15.037-47.503-33.984-66.763-56.379c29.187-33.941,66.053-60.018,106.947-76.426 c-6.279,14.002-9.853,29.486-9.853,45.827c0,16.597,3.696,32.3,10.165,46.476l35.802-35.797 c-5.698-5.594-9.248-13.36-9.248-21.977c0-17.02,13.801-30.82,30.82-30.82c8.611,0,16.383,3.55,21.971,9.248l32.534-32.534 l36.635-36.628l18.366-18.373c-21.206-4.186-42.896-6.469-64.848-6.469c-107.663,0-209.732,52.155-273.038,139.518L0,298.288 l13.011,17.957C36.83,349.116,66.151,376.999,99.187,398.999z"/> <path d="M459.208,188.998l-44.854,44.854c30.539,16.071,58.115,37.846,80.986,64.437 c-52.167,60.662-128.826,96.273-209.292,96.273c-10.3,0-20.533-0.6-30.661-1.744l-52.375,52.375 c26.903,6.887,54.762,10.57,83.036,10.57c107.663,0,209.738-52.154,273.038-139.523l13.011-17.957l-13.011-17.956 C532.023,242.995,497.844,212.15,459.208,188.998z"/> <path d="M286.049,379.888c61.965,0,112.198-50.234,112.198-112.199c0-5.588-0.545-11.035-1.335-16.402L269.647,378.56 C275.015,379.349,280.461,379.888,286.049,379.888z"/> <path d="M248.815,373.431L391.79,230.455l4.994-4.994l45.796-45.796l86.764-86.77c13.543-13.543,13.543-35.502,0-49.046 c-6.77-6.769-15.649-10.159-24.523-10.159s-17.754,3.384-24.522,10.159l-108.33,108.336l-22.772,22.772l-29.248,29.248 l-48.14,48.14l-34.456,34.456l-44.027,44.027l-33.115,33.115l-45.056,45.055l-70.208,70.203 c-13.543,13.543-13.543,35.502,0,49.045c6.769,6.77,15.649,10.16,24.523,10.16s17.754-3.385,24.523-10.16l88.899-88.898 l50.086-50.086L248.815,373.431z"/> </g> </svg> ';
}

function banSVG (e) {
  e.innerHTML = ' <svg class="ban" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <g data-name="Layer 2"> <g data-name="person-delete"> <rect width="24" height="24" opacity="0" /> <path d="M20.47 7.5l.73-.73a1 1 0 0 0-1.47-1.47L19 6l-.73-.73a1 1 0 0 0-1.47 1.5l.73.73-.73.73a1 1 0 0 0 1.47 1.47L19 9l.73.73a1 1 0 0 0 1.47-1.5z" /> <path d="M10 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" /> <path d="M16 21a1 1 0 0 0 1-1 7 7 0 0 0-14 0 1 1 0 0 0 1 1z" /> </g> </g> </svg> ';
}

// From material design official website
function settingsGear (e) {
  e.innerHTML = '<svg class="svgButton" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>';
}
