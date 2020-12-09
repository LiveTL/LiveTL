const isFirefox = !!/Firefox/.exec(navigator.userAgent);

const embedDomain = EMBED_DOMAIN;

const allTranslators = { v: {} };
let allTranslatorCheckbox = {};
let showTimestamps = true;
let textDirection = 'bottom';

async function runLiveTL() {
  await setFavicon();

  switchChat();
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
    clientHeight: livetlContainer.clientWidth,
    scrollTop: livetlContainer.clientHeight,
    scrollHeight: livetlContainer.scrollHeight
  });

  scrollToBottom = (dims, force = false) => {
    if ((dims.clientHeight + dims.scrollTop >= dims.scrollHeight &&
      translationDiv.style.display != 'none') || force) {
      livetlContainer.scrollTo(0, livetlContainer.scrollHeight);
    }
  }

  let dimensionsBefore = getDimensions();
  window.updateDimensions = (force = false, goToTop = false) => {
    if (goToTop) {
      livetlContainer.scrollTo(0, 0);
    } else {
      scrollToBottom(dimensionsBefore, force);
    }
    dimensionsBefore = getDimensions();
  };

  window.onresize = updateDimensions;

  const settings = await createSettings(livetlContainer);

  allTranslatorCheckbox = createCheckbox('All Translators', 'allTranslatorID', true, () => {
    const boxes = document
      .querySelector('#transelectChecklist')
      .querySelectorAll('input:not(:checked)');
    boxes.forEach(box => {
      box.checked = allTranslatorCheckbox.checked;
    });
    checkboxUpdate();
  });

  appendE = el => {
    translationDiv.appendChild(el);
    if (textDirection === 'bottom')
      scrollToBottom(getDimensions());
  };

  appendE(await createWelcome());
  const hrParent = document.createElement('div');
  const hr = document.createElement('hr');
  hrParent.className = 'line'; // so it properly gets inverted when changing the text direction
  hr.className = 'sepLine';
  hrParent.appendChild(hr);
  appendE(hrParent);

  let observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(async messageNode => {
        const element = messageNode.querySelector("#message");
        if (!element)
          return;

        // Parse the message into it's different pieces
        const messageInfo = getMessageInfo(messageNode);

        // Determine whether we should display mod messages (if not set, default to yes)
        let displayModMessages = await getStorage('displayModMessages');
        if (displayModMessages == null) {
          displayModMessages = true;
          await setStorage('displayModMessages', true);
        }

        // Check to see if the sender is a mod, and we display mod messages
        if (messageInfo.author.moderator && displayModMessages) {
          // If the mod isn't in the sender list, add them
          if (!(messageInfo.author.id in allTranslators.v))
            await createCheckbox(messageInfo.author.name, messageInfo.author.id, true);

          // Check to make sure we haven't blacklisted the mod, and if not, send the message
          // After send the message, we bail so we don't have to run all the translation related things below
          if (await isChecked(messageInfo.author.id)) {
            appendE(createMessageEntry(messageInfo, element.textContent));
            return;
          }
        }

        // Try to parse the message into a translation and get the language we're looking for translations in
        const translation = parseTranslation(element.textContent);
        const selectedLanguage = document.querySelector('#langSelect');

        // Make sure we parsed the message into a translation, and if so, check to see if it matches our desired language
        if (
          translation != null &&
          isLangMatch(translation.lang.toLowerCase(), languageConversionTable[selectedLanguage.value]) &&
          translation.msg.replace(/\s/g, '') !== '')
        {
          // If the author isn't in the senders list, add them
          if (!(messageInfo.author.id in allTranslators.v))
            await createCheckbox(messageInfo.author.name, messageInfo.author.id, allTranslatorCheckbox.checked);

          // Check to see if the sender is approved, and send the message if they are
          if (await isChecked(messageInfo.author.id))
            appendE(createMessageEntry(messageInfo, translation.msg));
        }
      });
    });
  });

  observer.observe(document.querySelector("#items.yt-live-chat-item-list-renderer"), { childList: true });
}

function getMessageInfo(messageElement) {
  return {
    author: {
      id: /\/ytc\/([^\=]+)\=/.exec(messageElement.querySelector('#author-photo > img').src)[1],
      name: messageElement.querySelector('#author-name').textContent,
      moderator: messageElement.getAttribute('author-type') === 'moderator'
    },
    timestamp: messageElement.querySelector('#timestamp').textContent
  };
}

function switchChat() {
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

async function insertLiveTLButtons(isHolotools = false) {
  conlog('Inserting LiveTL Launcher Buttons');
  clearLiveTLButtons();
  params = parseParams();
  const makeButton = (text, callback, color) => {
    let a = document.createElement('span');
    a.appendChild(getLiveTLButton(color));
    a.className = 'liveTLBotan';
    const e = isHolotools ? document.querySelector('#input-panel') : document.querySelector('ytd-live-chat-frame');
    e.appendChild(a);
    a.querySelector('a').onclick = callback;
    a.querySelector('yt-formatted-string').textContent = text;
  };

  const redirectTab = u => window.location.href = u;
  const createTab = u => window.open(u);
  const createWindow = u => window.open(u, '',
    'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300'
  );


  getContinuation = (() => {
    let chatframe = document.querySelector("#chatframe");
    let src = chatframe.dataset.src;
    if (src.startsWith("https://www.youtube.com/live_chat_replay")) {
      return "&continuation=" + parseParams("?" + src.split("?")[1]).continuation;
    }
    return "";
  });

  getTitle = () => encodeURIComponent(document.querySelector("#container > .title").textContent);

  if (!isHolotools) {
    makeButton('Watch in LiveTL', async () =>
      redirectTab(`${await getWAR('index.html')}?v=${params.v}&title=${getTitle()}${getContinuation()}`));


    makeButton('Pop Out Translations',
      async () => {
        let tlwindow = createWindow(`${embedDomain}?v=${params.v}&mode=chat&title=${getTitle()}&useLiveTL=1${getContinuation()}`);
        document.querySelector("#chatframe").contentWindow.onmessage = d => {
          tlwindow.postMessage(d.data, "*");
        }
        document.querySelector("#chatframe").contentWindow.onbeforeunload = () => window.parent.postMessage('clearLiveTLButtons', '*');
      },
      'rgb(143, 143, 143)');
  } else {
    makeButton('Expand Translations',
      async () => {
        window.location.href = `${await getWAR('index.html')}?v=${params.v}&mode=chat&useLiveTL=1&noVideo=1`;
      });
  }
}

function isReplayChat() {
  return window.location.href.startsWith('https://www.youtube.com/live_chat_replay');
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
    removeEventListener('message', onMessageFromEmbeddedChat);
    return;
  }
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

let params = {};
let lastLocation = '';
async function loaded() {
  window.removeEventListener('load', loaded);
  window.removeEventListener('yt-navigate-finish', loaded);
  window.addEventListener('yt-navigate-finish', loaded);
  if (window.location.href == lastLocation) return;
  lastLocation = window.location.href;
  if (isChat()) {
    conlog('Using live chat');
    try {
      params = parseParams();
      if (params.useLiveTL) {
        conlog('Running LiveTL!');
        runLiveTL();
      } else if (params.embed_domain === 'hololive.jetri.co') {
        await insertLiveTLButtons(true);
      } else {
        window.parent.postMessage('embeddedChatLoaded', '*');
      }
    } catch (e) { }
  } else if (window.location.href.startsWith(embedDomain)) {
    setFavicon();
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
  window.onload = () => {
    const e = document.querySelector('#actionMessage');
    e.textContent = 'Thank you for installing LiveTL!';
  };
} else if (window.location.href.startsWith('https://www.youtube.com/embed/')) {
  window.onmessage = d => {
    try {
      parent.postMessage(d.data, '*')
    } catch (e) { }
  };
} else if (isReplayChat()) {
  try {
    window.parent.location.href;
  } catch (e) {
    window.addEventListener('message', d => {
      if (window.origin != d.origin) {
        postMessage(d.data);
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
  welcomeText.querySelector('#shareExtension').onclick = shareExtension;

  const versionInfo = document.createElement("div");
  versionInfo.classList.add("smallText");
  versionInfo.style.marginLeft = '0px';
  const details = await getFile('manifest.json', 'json');
  const update = await getFile('updateMessage.txt', 'text');
  versionInfo.innerHTML = `<strong>[NEW IN v${details.version}]:</strong> <span id='updateInfo'></span> `;
  versionInfo.querySelector('#updateInfo').textContent = update;
  const learnMore = document.createElement('a');
  learnMore.textContent = "Learn More";
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

function createCheckmark(authorID, checked, onchange) {
  const checkmark = document.createElement('input');
  checkmark.type = 'checkbox';
  checkmark.dataset.id = authorID;
  checkmark.checked = checked;
  checkmark.onchange = onchange;
  checkmark.addEventListener("change", async (e) => {
    await setStorage(checkmark.dataset.id, checkmark.checked);
  });
  return checkmark;
}

function createCheckboxPerson(name, authorID) {
  const person = document.createElement('label');
  person.setAttribute('for', authorID);
  person.textContent = name;
  return person;
}

// checked doesn't do anything, its just there for legacy
async function createCheckbox(name, authorID, checked = false, callback = null) {
  checked = await isChecked(authorID);
  const items = getChecklistItems();
  const checkbox = createCheckmark(authorID, checked, callback || checkboxUpdate);
  const selectTranslatorMessage = document.createElement('li');
  selectTranslatorMessage.appendChild(checkbox);
  selectTranslatorMessage.appendChild(createCheckboxPerson(name, authorID));
  selectTranslatorMessage.style.marginRight = '4px';
  items.appendChild(selectTranslatorMessage);
  checkboxUpdate();
  return checkbox;
}

function filterBoxes(boxes) {
  boxes.forEach((box) => {
    allTranslators.v[box.dataset.id] = box;
    if (box !== allTranslatorCheckbox && !box.checked) {
      allTranslatorCheckbox.checked = false;
    }
  });
}

function checkAll() {
  const boxes = getChecklist().querySelectorAll('input:not(:checked)');
  boxes.forEach(box => box.checked = true);
}

function removeBadTranslations() {
  document.querySelectorAll('.line').forEach((translation, i) => {
    // if (i > 25) {
    //     translation.remove();
    // } else
    // removed limiting
    const author = translation.querySelector('.smallText');
    if (author && author.dataset.id && !allTranslators.v[author.dataset.id].checked) {
      translation.remove();
    }
  });
}

function checkboxUpdate() {
  const boxes = getChecklist().querySelectorAll('input');
  allTranslators.v = {};
  filterBoxes(boxes);
  if (allTranslatorCheckbox.checked) {
    checkAll();
  }
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
  authorName.className = 'smallText';

  if (messageInfo.author.moderator)
    authorName.style.color = 'var(--yt-live-chat-moderator-color)';

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
  hide.className = 'hasTooltip'
  hide.style.cursor = 'pointer';
  hide.onclick = () => translation.remove();

  hideSVG(hide);
  hide.appendChild(createTooltip('Hide Message'))

  return hide;
}

function createAuthorBanButton(authorID) {
  const ban = document.createElement('span');
  ban.className = 'hasTooltip'
  ban.style.cursor = 'pointer';
  ban.onclick = async () => {
    allTranslators.v[authorID].checked = false;
    await saveUserStatus(authorID, false);
    checkboxUpdate();
  };

  banSVG(ban);
  ban.appendChild(createTooltip('Blacklist User'))

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
  line.onmouseover = () => line.querySelector('.messageOptions').style.display = 'inline-block';
  line.onmouseleave = () => line.querySelector('.messageOptions').style.display = 'none';
}

function createMessageEntry(messageInfo, message) {
  const line = document.createElement('div');
  line.className = 'line message';
  if (messageInfo.author.moderator)
    line.classList.add('mod');

  if (textDirection === 'top') {
    line.style.marginBottom = '0';
  }

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


