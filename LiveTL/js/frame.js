const isFirefox = !!/Firefox/.exec(navigator.userAgent);

const embedDomain = EMBED_DOMAIN;

const allTranslators = { byID: {}, byName: {} };
// byName is unused, always checking from storage
const verifiedTranslators = [];
const distinguishedUsers = [];
let allTranslatorCheckbox = {};
let showTimestamps = true;
let textDirection = 'bottom';

async function addedByUser(id) {
  let s = (await getUserStatus(id, true)).checked;
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
  await setFavicon();

  await switchChat();
  document.title = 'LiveTL Chat';

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
    if ((dims.clientHeight + dims.scrollTop >= dims.scrollHeight &&
      translationDiv.style.display != 'none') || force) {
      livetlContainer.scrollTo(0, livetlContainer.scrollHeight + 100);
    }
  };

  window.updateDimensions = (dims, force = false, goToTop = false) => {
    dims = dims || getDimensions();
    if (goToTop) {
      livetlContainer.scrollTo(0, 0);
    } else {
      scrollToBottom(dims, force);
    }
  };

  let dimsBefore = getDimensions();
  window.addEventListener('resize', () => {
    if (translationDiv.style.display != 'none') {
      updateDimensions(dimsBefore);
      dimsBefore = getDimensions();
    }
  });

  const settings = await createSettings(livetlContainer);

  allTranslatorCheckbox = await createCheckbox('Automatically Detect', undefined, await isChecked('allUsers'), false, async () => {
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

  let processedMessages = [];

  let container = document.querySelector('.livetl');

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
      if (isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id,
          await getUserStatusAsBool(messageInfo.author.name));
      }
      checked = (await isChecked(messageInfo.author.id));
      // Check to make sure we haven't blacklisted the mod, and if not, send the message
      // After send the message, we bail so we don't have to run all the translation related things below
      if (checked) {
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
      if (isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id,
          await getUserStatusAsBool(messageInfo.author.name));
      }

      checked = (await isChecked(messageInfo.author.id));
      // Check to see if the sender is approved, and send the message if they are
      if (checked) {
        prependOrAppend(createMessageEntry(messageInfo, translation.msg));
        return;
      }
    }

    // if the user manually added this person
    if (await addedByUser(messageInfo.author.name)) {
      if (isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id, true);
      }
      checked = (await isChecked(messageInfo.author.id));
      if (checked)
        prependOrAppend(createMessageEntry(messageInfo, messageInfo.message));
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
}

async function insertLiveTLButtons(isHolotools = false) {
  console.log('Inserting LiveTL Launcher Buttons');
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
  const createWindow = u => window.open(u, '',
    'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300'
  );


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

    makeButton('Pop Out Translations',
      async () => {
        params = parseParams();
        let tlwindow = createWindow(`${embedDomain}?v=${params.v}&mode=chat${restOfURL()}`);
        document.querySelector('#chatframe').contentWindow.addEventListener('message', d => {
          tlwindow.postMessage(d.data, '*');
        });
        window.addEventListener('message', m => {
          if (typeof m.data == 'object') {
            switch (m.data.type) {
              case 'messageChunk':
                tlwindow.postMessage(m.data, '*');
                break;
            }
          }
        })
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

async function loaded() {
  // window.removeEventListener('load', loaded);
  // window.removeEventListener('yt-navigate-finish', loaded);
  // window.addEventListener('yt-navigate-finish', loaded);
  if (window.location.href == lastLocation) return;
  lastLocation = window.location.href;
  if (isChat()) {
    console.log('Using live chat');
    try {
      params = parseParams();
      if (params.useLiveTL) {
        console.log('Running LiveTL!');
        runLiveTL();
      } else {
        console.log('Monitoring network events');
        chrome.runtime.onMessage.addListener((d) => window.dispatchEvent(new CustomEvent('chromeMessage', { detail: d })));
        window.addEventListener('chromeMessage', async (d) => {
          heads = {};
          d.detail.headers.forEach(h => {
            heads[h.name] = h.value;
          });
          heads.livetl = 1;
          let response = await (await fetch(d.detail.url, {
            method: 'POST',
            headers: heads,
            body: d.detail.body
          })).json();
          let messages = [];
          if (!response.continuationContents) return;
          (response.continuationContents.liveChatContinuation.actions || []).forEach(action => {
            try {
              var currentElement = (action.addChatItemAction || action.replayChatItemAction.actions[0].addChatItemAction).item;
              let item = currentElement.liveChatTextMessageRenderer;
              let authorTypes = [];
              (item.authorBadges || []).forEach(badge =>
                authorTypes.push(badge.liveChatAuthorBadgeRenderer.tooltip));
              if (!item.message.runs[0].text) return;
              item = {
                author: {
                  name: item.authorName.simpleText,
                  id: item.authorExternalChannelId,
                  types: authorTypes
                },
                message: item.message.runs[0].text,
                timestamp: item.timestampUsec
              };
              messages.push(item);
            } catch (e) { console.log(e) }
          });
          window.parent.postMessage({
            type: 'messageChunk',
            messages: messages
          }, '*');
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
    } catch (e) { }
  }
}

window.addEventListener('message', onMessageFromEmbeddedChat);
window.addEventListener('load', loaded);
window.addEventListener('yt-navigate-start', clearLiveTLButtons);

if ((isVideo() || isChat()) && isFirefox) {
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
  try {
    window.parent.location.href;
  } catch (e) {
    // if it's a framed chat. will have to change
    // when the livetl chat is made local
    window.addEventListener('message', d => {
      if (window.origin != d.origin) {
        postMessage(d.data);
      } else {
        // console.log(d.data);
      }
    });
    switchChat();
  }
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
  let date = (new Date(parseInt(timestamp) / 1000)).toLocaleTimeString(navigator.language,
    { hour: '2-digit', minute: '2-digit' });
  timestampElement.textContent = ` (${date})`;
  timestampElement.className = 'timestampText smallText';
  timestampElement.style.display = showTimestamps ? 'contents' : 'none';

  return timestampElement;
}

function createAuthorNameElement(messageInfo) {
  const authorName = document.createElement('span');
  authorName.textContent = `${messageInfo.author.name}`;
  authorName.dataset.id = messageInfo.author.id;
  authorName.className = `smallText ${messageInfo.author.type}`;

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


