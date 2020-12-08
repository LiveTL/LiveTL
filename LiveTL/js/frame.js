function conlog(...args) {
  if (params.devMode) {
    return console.log(...args);
  }
}

const isFirefox = !!/Firefox/.exec(navigator.userAgent);

const languageConversionTable = {};

const embedDomain = EMBED_DOMAIN;

// WAR: web accessible resource
async function getWAR(u) {
  return new Promise((res, rej) => chrome.runtime.sendMessage({ type: 'get_war', url: u }, r => res(r)));
}

async function getFile(name, format) {
  return await (await fetch(await getWAR(name)))[format]();
}

// global helper function to handle scrolling
function updateSize() {
  const pix = document.querySelector('.dropdown-check-list').getBoundingClientRect().bottom;
  document.querySelector('.modal').style.height = pix + 'px';
}

const allTranslators = { v: {} };
let allTranslatorCheckbox = {};

async function runLiveTL() {
  await setFavicon();

  switchChat();
  setTimeout(async () => {
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

    setInterval(() => {
      const messages = document.querySelectorAll('.yt-live-chat-text-message-renderer > #message');
      let i = 0;
      while (i < messages.length && messages[i].innerHTML === '') i++;
      for (; i < messages.length; i++) {
        const m = messages[i];
        if (m.innerHTML === '') break;
        const parsed = parseTranslation(m.textContent);
        const select = document.querySelector('#langSelect');
        if (parsed != null && isLangMatch(parsed.lang.toLowerCase(), languageConversionTable[select.value]) &&
          parsed.msg.replace(/\s/g, '') !== '') {
          const author = m.parentElement.childNodes[1].textContent;
          const authorID = /\/ytc\/([^\=]+)\=/.exec(getProfilePic(m))[1];
          const line = createTranslationElement(author, authorID, parsed.msg);
          if (!(authorID in allTranslators.v)) {
            createCheckbox(author, authorID, allTranslatorCheckbox.checked);
          }
          isChecked(authorID).then(checked => {
            if (checked) {
              prependE(line);
            }
          });
        }
        m.innerHTML = '';
      }
      createSettingsProjection(prependE);
    }, 1000);
  }, 100);
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

async function insertLiveTLButtons(isHolotools = false) {
  conlog('Inserting LiveTL Launcher Buttons');
  params = parseParams();
  const makeButton = (text, callback, color) => {
    let a = document.createElement('span');
    a.appendChild(getLiveTLButton(color));
    a.className = 'liveTLBottan';

    const interval2 = setInterval(() => {
      const e = isHolotools ? document.querySelector('#input-panel') : document.querySelector('ytd-live-chat-frame');
      if (e != null && document.querySelectorAll(".liveTLBottan").length < 2) {
        clearInterval(interval2);
        e.appendChild(a);
        a.querySelector('a').onclick = callback;
        a.querySelector('yt-formatted-string').textContent = text;
      }
    }, 100);
  };

  const redirectTab = u => window.location.href = u;
  const createTab = u => window.open(u);
  const createWindow = u => window.open(u, '',
    'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300'
  );


  getContinuation = (() => {
    let chatframe = document.querySelector("#chatframe");
    let src = chatframe.src;
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
      },
      'rgb(143, 143, 143)');
  } else {
    makeButton('Expand Translations',
      async () => {
        window.location.href = `${await getWAR('index.html')}?v=${params.v}&mode=chat&useLiveTL=1&noVideo=1`;
      });
  }
}

let params = {};
let lastLocation = "";
const activationInterval = setInterval(async () => {
  if (window.location.href == lastLocation) return;
  lastLocation = window.location.href;
  if (window.location.href.startsWith('https://www.youtube.com/live_chat') ||
    window.location.href.startsWith("https://www.youtube.com/live_chat_replay")) {
    conlog('Using live chat');
    try {
      params = parseParams();
      if (params.useLiveTL) {
        conlog('Running LiveTL!');
        runLiveTL();
      } else if (params.embed_domain === 'hololive.jetri.co') {
        await insertLiveTLButtons(true);
      }
    } catch (e) { }
  } else if (window.location.href.startsWith('https://www.youtube.com/watch')) {
    conlog('Watching video');
    const interval = setInterval(async () => {
      if (document.querySelector('#chatframe')) {
        clearInterval(interval);
        document.querySelector('#chatframe').onload = async () => await insertLiveTLButtons();
      }
    }, 100);
  } else if (window.location.href.startsWith(embedDomain)) {
    setFavicon();
  }
}, 1000);

// function changeThemeAndRedirect(dark) {
//   var url = new URL(location.href);
//   url.searchParams.set('dark_theme', dark);
//   location.href = url.toString();
// }

if (window.location.href.startsWith('https://kentonishi.github.io/LiveTL/about')) {
  window.onload = () => {
    const e = document.querySelector('#actionMessage');
    e.textContent = 'Thank you for installing LiveTL!';
  };
} else if (window.location.href.startsWith("https://www.youtube.com/embed/")) {
  window.onmessage = d => {
    try {
      parent.postMessage(d.data, "*")
    } catch (e) { }
  };
} else if (window.location.href.startsWith("https://www.youtube.com/live_chat_replay")) {
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
    flex: 'none',
    none: 'flex'
  };

  const icon = {
    flex: closeSVG,
    none: settingsGear
  };

  settingsButton.addEventListener('click', async (e) => {
    const newDisplay = nextStyle[modalContainer.style.display];
    modalContainer.style.display = newDisplay;
    icon[newDisplay](settingsButton);
    if (newDisplay === 'none') {
      document.querySelector('.translationText').style.display = 'block';
      modalContainer.style.height = 'auto';
    } else {
      document.querySelector('.translationText').style.display = 'none';
      updateSize();
    }

    // let previousTheme = await getStorage('theme');
    // let themeToggle = document.querySelector("#darkThemeToggle");
    // if (themeToggle.value != previousTheme) {
    //   let dark = themeToggle.value == 'dark' ? 1 : 0;
    //   await setStorage('theme', themeToggle.value);
    //   window.parent.postMessage({ type: "themeChange", "darkTheme": dark }, "*");
    //   changeThemeAndRedirect(dark);
    // }
  });

  modalContainer.appendChild(modalContent);

  container.appendChild(settingsButton);
  container.appendChild(modalContainer);

  return modalContent;
}

async function importFontAwesome() {
  document.head.innerHTML += `
    <link 
     rel="stylesheet"
     href="https://cdn.jsdelivr.net/npm/fork-awesome@1.1.7/css/fork-awesome.min.css"
     integrity="sha256-gsmEoJAws/Kd3CjuOQzLie5Q3yshhvmo7YNtBG7aaEY="
     crossorigin="anonymous">
        `;
}

function setSelectInputCallbacks(select, defaultValue) {
  select.onfocus = () => select.value = '';
  const updateSelect = async () => {
    if (!(select.value in languageConversionTable)) {
      select.value = defaultValue;
    }
    await setDefaultLanguage(select.value);
    await getDefaultLanguage();
  };
  select.onblur = updateSelect;
  select.onchange = updateSelect;
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
  checklist.querySelector('.anchor').onclick = () => {
    const items = checklist.querySelector('#items');
    if (items.style.display !== 'block') {
      checklist.classList.add('openList');
      items.style.display = 'block';
    } else {
      checklist.classList.remove('openList');
      items.style.display = 'none';
    }
    updateSize();
  };
}

function setChecklistOnblur(checklist) {
  checklist.onblur = e => {
    const items = checklist.querySelector('#items');
    if (!e.currentTarget.contains(e.relatedTarget)) {
      checklist.classList.remove('openList');
      items.style.display = 'none';
    } else e.currentTarget.focus();
    updateSize();
  };
}

function setChecklistCallbacks(checklist) {
  setChecklistOnclick(checklist);
  setChecklistOnblur(checklist);
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
  translatorSelectLabel.innerHTML = 'Translators:&nbsp';
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

function createTranslatorSelect() {
  const translatorSelectContainer = document.createElement('div');
  translatorSelectContainer.appendChild(createTransSelectLabel());
  translatorSelectContainer.appendChild(createTransSelectChecklist());
  return translatorSelectContainer;
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
  zoomSlider.onchange = () => updateZoomLevel();

  return zoomSlider;
}

async function updateZoomLevel() {
  let value = parseFloat(document.getElementById(zoomSliderInputId).value) || await getStorage('zoom') || 1
  let scale = Math.ceil(value * 100);
  let livetlContainer = document.querySelector('.livetl');
  livetlContainer.style.transformOrigin = '0 0';
  livetlContainer.style.transform = `scale(${scale / 100})`;
  let inverse = 10000 / scale;
  livetlContainer.style.width = `${inverse}%`;
  livetlContainer.style.height = `${inverse}%`;
  await setStorage('zoom', scale / 100);
}

function createZoomResetButton() {
  let resetButton = document.createElement('input');
  resetButton.value = 'Reset';
  resetButton.style.marginLeft = '4px';
  resetButton.style.verticalAlign = 'middle';
  resetButton.type = 'button';
  resetButton.onclick = async () => {
    document.getElementById(zoomSliderInputId).value = 1;
    await updateZoomLevel();
  }

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

async function createSettings(container) {
  const settings = createModal(container);
  settings.appendChild(createLanguageSelect());
  settings.appendChild(createTranslatorSelect());
  settings.appendChild(await createZoomSlider())
  // This needs to be called after the zoomSlider is added to the DOM, otherwise it won't be able to find the element and read the value
  await updateZoomLevel();

  return settings;
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
  a.href = 'https://kentonishi.github.io/LiveTL/about/';
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
    url: 'https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg'
  });
}

async function createWelcomeText() {
  const welcomeText = document.createElement('span');
  welcomeText.textContent = 'Welcome to LiveTL! Translations will appear above.';
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
  ban.onclick = () => {
    allTranslators.v[authorID].checked = false;
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

function getProfilePic(el) {
  return el.parentElement.parentElement.querySelector('img').src;
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
