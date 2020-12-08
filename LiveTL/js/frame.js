const isFirefox = !!/Firefox/.exec(navigator.userAgent);

const languageConversionTable = {};

const embedDomain = EMBED_DOMAIN;

const allTranslators = { v: {} };
let allTranslatorCheckbox = {};

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

  const settings = await createSettings(livetlContainer);
  livetlContainer.appendChild(translationDiv);

  allTranslatorCheckbox = createCheckbox('All Translators', 'allTranslatorID', true, () => {
    const boxes = document
      .querySelector('#transelectChecklist')
      .querySelectorAll('input:not(:checked)');
    boxes.forEach(box => {
      box.checked = allTranslatorCheckbox.checked;
    });
    checkboxUpdate();
  });

  prependE = el => translationDiv.prepend(el);

  prependE(await createWelcome());

  let observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(m => {
        const parsed = parseTranslation(m.querySelector("#message").textContent);
        const select = document.querySelector('#langSelect');
        if (parsed != null && isLangMatch(parsed.lang.toLowerCase(), languageConversionTable[select.value]) &&
          parsed.msg.replace(/\s/g, '') !== '') {
          const author = m.querySelector("#author-name").textContent;
          const authorID = /\/ytc\/([^\=]+)\=/.exec(m.querySelector("#author-photo > img").src)[1];
          const line = createTranslationElement(author, authorID, parsed.msg);
          if (!(authorID in allTranslators.v)) {
            createCheckbox(author, authorID, allTranslatorCheckbox.checked);
          }
          isChecked(authorID).then(checked => {
            if (checked) {
              prependE(line);
            }
            createSettingsProjection(prependE);
          });
        }
      });
    });
  });

  observer.observe(document.querySelector("#items.yt-live-chat-item-list-renderer"), { childList: true });
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

async function onMessageFromEmbeddedChat(m) {
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
  } else if (isVideo()) {
    window.removeEventListener('message', onMessageFromEmbeddedChat);
    window.addEventListener('message', onMessageFromEmbeddedChat);
  } else if (window.location.href.startsWith(embedDomain)) {
    setFavicon();
  }
}

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

async function shareExtension() {
  const details = await getFile('manifest.json', 'json');
  navigator.share({
    title: details.name,
    text: details.description,
    url: 'https://kentonishi.github.io/LiveTL'
  });
}

async function createWelcomeText() {
  const welcomeText = document.createElement('span');
  welcomeText.textContent = 'Welcome to LiveTL! Translations picked up from the chat will appear here.';
  const buttons = document.createElement('div');
  buttons.classList.add('smallText');
  buttons.style.marginLeft = '0px';
  buttons.innerHTML = `
    Please consider
    <a id="shareExtension" href="javascript:void(0);">sharing LiveTL with your friends</a>, 
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

function createAuthorNameElement(author, authorID) {
  const authorName = document.createElement('span');
  authorName.textContent = author;
  authorName.dataset.id = authorID;
  authorName.className = 'smallText';
  return authorName;
}

function createAuthorHideButton(translation) {
  const hide = document.createElement('span');
  hide.style.cursor = 'pointer';
  hide.onclick = () => translation.remove();
  hideSVG(hide);
  return hide;
}

function createAuthorBanButton(authorID) {
  const ban = document.createElement('span');
  ban.onclick = async () => {
    allTranslators.v[authorID].checked = false;
    await saveUserStatus(authorID, false);
    checkboxUpdate();
  };
  ban.style.cursor = 'pointer';
  banSVG(ban);
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

function createAuthorInfoElement(author, authorID, line) {
  const authorInfo = document.createElement('span');
  authorInfo.appendChild(createAuthorNameElement(author, authorID));
  authorInfo.appendChild(createAuthorInfoOptions(authorID, line));
  return authorInfo;
}

function setTranslationElementCallbacks(line) {
  line.onmouseover = () => line.querySelector('.messageOptions').style.display = 'inline-block';
  line.onmouseleave = () => line.querySelector('.messageOptions').style.display = 'none';
}

function createTranslationElement(author, authorID, translation) {
  const line = document.createElement('div');
  line.className = 'line';
  line.textContent = translation;
  setTranslationElementCallbacks(line);
  line.appendChild(createAuthorInfoElement(author, authorID, line));
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
