const isFirefox = !!/Firefox/.exec(navigator.userAgent);

const embedDomain = EMBED_DOMAIN;

const allTranslators = {};
const verifiedTranslators = []; //['AAUvwniNIzjhlVnN_WMmV2iBzQ2VuLm3Ix1EbqeHleDP']; // FIXME don't hardcode this....
const distinguishedUsers = []; //['AAUvwnibH7aEJcoVdPRBx0fIUKxeC25FPeVEt17wGQ']; // TODO don't hardcode this....
let allTranslatorCheckbox = {};
let showTimestamps = true;
let textDirection = 'bottom';

async function addedByUser(id) {
  let s = (await getUserStatus(id));
  if ((id in allTranslators) && (s.addedByUser)) {
    allTranslators[id] = allTranslators[id] || s;
    return true;
  }
  return false;
}

// javascript 'enum'
const authorType = {
  MOD: 'mod',
  VERIFIED: 'verified',
  DISTINGUISHED: 'distinguished', // subject to change
  STANDARD: 'standard'
};

async function onMessageSelect(e, container) {
  e = findParent(e.target);
  const messageInfo = getMessageInfo(e);
  if (isNewUser(messageInfo.author.id)) {
    allTranslators[messageInfo.author.id] = { addedByUser: true };
    await createCheckbox(messageInfo.author.name, messageInfo.author.id,
      await getUserStatusAsBool(messageInfo.author.name), true);
  }
  // await saveUserStatus(messageInfo.author.id);
  closeMessageSelector(container);
}

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

  allTranslatorCheckbox = await createCheckbox('All Detected', 'allUsers', await isChecked('allUsers'), false, async () => {
    const boxes = document
      .querySelector('#transelectChecklist')
      .querySelectorAll('input:not(:checked)');
    for (i = 0; i < boxes.length; i++) {
      // DO NOT CHANGE TO FOREACH
      box = boxes[i];
      box.checked = allTranslatorCheckbox.checked;
      box.saveStatus();
    }
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

  onNewMessage = async messageNode => {
    // Check to see if this message has already been processed
    if (processedMessages.includes(messageNode.id) === false) {
      // Record the fact that we processed this message
      processedMessages.push(messageNode.id);

      // Keep memory usage low(er) by trimming the array every so often
      if (processedMessages.length > 25)
        processedMessages = processedMessages.slice(0, 10)
    } else return; // bail (why the fuck is it being mutated again?)

    const element = messageNode.querySelector('#message');

    messageNode = findParent(messageNode);

    if (!messageNode) return;
    // Parse the message into it's different pieces
    const messageInfo = getMessageInfo(messageNode);

    if (!messageInfo) return;

    let container = document.querySelector('.livetl');

    messageNode.addEventListener('mousedown', async e => await onMessageSelect(e, container));

    // Determine whether we should display mod messages (if not set, default to yes)
    let displayModMessages = await getStorage('displayModMessages');
    if (displayModMessages == null) {
      displayModMessages = true;
      await setStorage('displayModMessages', true);
    }

    // Check to see if the sender is a mod, and we display mod messages
    if (messageInfo.author.type === authorType.MOD && displayModMessages &&
      element.textContent.replace(/\s/g, '') !== '') {
      // If the mod isn't in the sender list, add them
      if (isNewUser(messageInfo.author.id)) {
        await createCheckbox(messageInfo.author.name, messageInfo.author.id,
          await getUserStatusAsBool(messageInfo.author.name));
      }
      checked = (await isChecked(messageInfo.author.id));
      // Check to make sure we haven't blacklisted the mod, and if not, send the message
      // After send the message, we bail so we don't have to run all the translation related things below
      if (checked) {
        prependOrAppend(createMessageEntry(messageInfo, element.textContent));
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
      translation.msg.replace(/\s/g, '') !== '') {
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
    if (await addedByUser(messageInfo.author.id) && element.textContent.replace(/\s/g, '') !== '') {
      checked = (await isChecked(messageInfo.author.id));
      if (checked)
        prependOrAppend(createMessageEntry(messageInfo, element.textContent));
      return;
    }
  };

  let observer = new MutationObserver(async (mutations, observer) => {
    for (let m = 0; m < mutations.length; m++) {
      let mutation = mutations[m];
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        // DO NOT CHANGE TO FOREACH
        await onNewMessage(mutation.addedNodes[i]);
      }
    }
  });

  observer.observe(document.querySelector('#items.yt-live-chat-item-list-renderer'), { childList: true });
  let initialNodes = document.querySelector('#items.yt-live-chat-item-list-renderer').childNodes;
  for (let i = 0; i < initialNodes.length; i++) {
    // DO NOT CHANGE TO FOREACH
    await onNewMessage(initialNodes[i]);
  }
}

function getAuthorType(messageElement, authorId) {
  if (messageElement.getAttribute('author-type') === 'moderator' ||
    messageElement.getAttribute('author-type') === 'owner')
    return authorType.MOD;

  if (verifiedTranslators.includes(authorId))
    return authorType.VERIFIED;

  if (distinguishedUsers.includes(authorId))
    return authorType.DISTINGUISHED;

  return authorType.STANDARD;
}

function getMessageInfo(messageElement) {
  // set this here so that we can access it when getting author type
  // let img = messageElement.querySelector('#author-photo > img');
  // if (!img) return;
  const id = messageElement.querySelector('#author-name').textContent.replace(/\n/g, ' ');
  // image src detection is broken
  // /\/ytc\/([^\=]+)\=/.exec(img.src)[1];

  return {
    author: {
      id: id,
      name: id,
      type: getAuthorType(messageElement, id)
    },
    timestamp: messageElement.querySelector('#timestamp').textContent
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
    a.querySelector('a').addEventListener('click', callback);
    a.querySelector('yt-formatted-string').textContent = text;
  };

  const redirectTab = u => window.location.href = u;
  const createTab = u => window.open(u);
  const createWindow = u => window.open(u, '',
    'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300'
  );

  getContinuation = (() => {
    let chatframe = document.querySelector('#chatframe');
    let src = chatframe.dataset.src;
    if (src.startsWith('https://www.youtube.com/live_chat_replay')) {
      return '&continuation=' + parseParams('?' + src.split('?')[1]).continuation;
    }
    return '';
  });

  getTitle = () => encodeURIComponent(document.querySelector('#container > .title').textContent);

  if (!isHolotools) {
    makeButton('Watch in LiveTL', async () => {
      params = parseParams();
      redirectTab(`${await getWAR('index.html')}?v=${params.v}&title=${getTitle()}${getContinuation()}`);
    });

    makeButton('Pop Out Translations',
      async () => {
        params = parseParams();
        let tlwindow = createWindow(`${embedDomain}?v=${params.v}&mode=chat&title=${getTitle()}&useLiveTL=1${getContinuation()}`);
        document.querySelector('#chatframe').contentWindow.addEventListener('message', d => {
          tlwindow.postMessage(d.data, '*');
        });
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
  // window.removeEventListener('load', loaded);
  // window.removeEventListener('yt-navigate-finish', loaded);
  // window.addEventListener('yt-navigate-finish', loaded);
  if (window.location.href == lastLocation) return;
  lastLocation = window.location.href;
  if (isChat()) {
    conlog('Using live chat');
    try {
      params = parseParams();
      if (params.useLiveTL) {
        conlog('Running LiveTL!');
        runLiveTL();
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
      ob.observe(document.querySelector('#chat #items'), { childList: true });
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
    window.addEventListener('message', d => {
      if (window.origin != d.origin) {
        postMessage(d.data);
      } else {
        conlog(d.data);
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

async function createCheckbox(name, authorID, checked = false, addedByUser = false, callback = null) {
  const items = getChecklistItems();
  const checkbox = createCheckmark(authorID, checked, addedByUser, callback || checkboxUpdate);
  const selectTranslatorMessage = document.createElement('li');
  selectTranslatorMessage.appendChild(checkbox);
  selectTranslatorMessage.appendChild(createCheckboxPerson(name, authorID));
  selectTranslatorMessage.style.marginRight = '4px';
  items.appendChild(selectTranslatorMessage);
  allTranslators[authorID] = allTranslators[authorID] || {};
  allTranslators[authorID].checked = checked;
  await saveUserStatus(authorID, checked, addedByUser);
  checkboxUpdate();
  return checkbox;
}

function filterBoxes(boxes) {
  boxes.forEach((box) => {
    allTranslators[box.dataset.id] = allTranslators[box.dataset.id] || {};
    allTranslators[box.dataset.id].checkbox = box;
    allTranslators[box.dataset.id].checked = box.checked;
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
    const author = translation.querySelector('.smallText');
    if (author && author.dataset.id && !allTranslators[author.dataset.id].checked) {
      translation.remove();
    }
  });
}

function checkboxUpdate() {
  const boxes = getChecklist().querySelectorAll('input');
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
  authorName.className = `smallText ${messageInfo.author.type}`;

  // capitalize the first letter
  const type = messageInfo.author.type.charAt(0).toUpperCase() + messageInfo.author.type.slice(1);
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
    allTranslators[authorID].checked = allTranslators[authorID].checkbox.checked = false;
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


