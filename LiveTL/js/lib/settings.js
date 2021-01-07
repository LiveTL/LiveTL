/**
 * Dependencies:
 *
 * constants.js
 * storage.js
 * svgs.js
 *
 * Other:
 *
 * needs languageConversionTable = {} declared before this module
 */

import { languages, languageConversionTable } from './constants.js';
import {
  saveUserStatus,
  getDefaultLanguage,
  setDefaultLanguage,
  setupDefaultCaption,
  setupDefaultCaptionDelay,
  setupDefaultSpeechSynth,
  setupDefaultTranslatorMode,
  getCaptionZoom,
  setCaptionZoom,
  getStorage,
  setStorage
} from './storage.js';
import { closeSVG, settingsGear } from './svgs.js';


const enableDarkModeToggle = false;

async function createSettings (container) {
  const settings = createModal(container);
  settings.appendChild(createLanguageSelect());
  settings.appendChild(createTranslatorSelect());
  settings.appendChild(createCustomUserButton(container));
  settings.appendChild(await createDisplayModMessageToggle());
  settings.appendChild(await createZoomSlider());
  settings.appendChild(await createTimestampToggle());
  settings.appendChild(await createTextDirectionToggle(container));
  if (!parseParams(window.parent.location.href).noVideo) {
    settings.appendChild(await createChatSideToggle());
    settings.appendChild(await createCaptionDisplayToggle());
    settings.appendChild(await createCaptionDuration());
    settings.appendChild(await createCaptionZoomSlider());
  }
  if (!isAndroid) {
    settings.appendChild(await createSpeechSynthToggle());
    settings.appendChild(await createTranslatorModeToggle());
  }

  return settings;
}

function createModal (container) {
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
      const previousTheme = await getStorage('theme');
      const themeToggle = document.querySelector('#darkThemeToggle');
      if (themeToggle.value != previousTheme) {
        const dark = themeToggle.value == 'dark' ? 1 : 0;
        await setStorage('theme', themeToggle.value);
        window.parent.postMessage({ type: 'themeChange', darkTheme: dark }, '*');
        changeThemeAndRedirect(dark);
      }
    }
  });

  modalContainer.appendChild(modalContent);

  document.body.appendChild(settingsButton);
  container.appendChild(modalContainer);

  return modalContent;
}

function setSelectInputCallbacks (select, defaultValue) {
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

function createLangSelectionName (lang) {
  return `${lang.name} (${lang.lang})`;
}

function createLangSelectOption (lang) {
  const opt = document.createElement('option');
  const langName = createLangSelectionName(lang);
  opt.value = langName;
  opt.innerText = langName;
  return opt;
}

languages.forEach(i => languageConversionTable[createLangSelectionName(i)] = i);

function createLangSelectLabel () {
  const langSelectLabel = document.createElement('span');
  langSelectLabel.className = 'optionLabel';
  langSelectLabel.textContent = 'Language: ';
  return langSelectLabel;
}

function createSelectInput () {
  const select = document.createElement('select');
  // select.dataset.role = 'none';
  // select.setAttribute('list', 'languages');
  // select.setAttribute('autocomplete', 'off');
  select.id = 'langSelect';
  getDefaultLanguage().then(defaultLang => {
    select.value = defaultLang || createLangSelectionName(languages[0]);
    setSelectInputCallbacks(select, select.value);
  });
  return select;
}

function createLangSelectDatalist (datalist) {
  const appendDatalist = e => datalist.appendChild(e);
  languages.map(createLangSelectOption).map(appendDatalist);
  return datalist;
}

function createLanguageSelect () {
  const langSelectContainer = document.createElement('div');
  langSelectContainer.appendChild(createLangSelectLabel());
  const langInput = createSelectInput();
  langSelectContainer.appendChild(langInput);
  langSelectContainer.appendChild(createLangSelectDatalist(langInput));
  return langSelectContainer;
}

function setChecklistOnclick (checklist) {
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
  
}

function setChecklistOnblur (checklist) {
  checklist.addEventListener('blur', e => {
    const items = checklist.querySelector('#items');
    if (!e.currentTarget.contains(e.relatedTarget)) {
      checklist.classList.remove('openList');
      items.style.display = 'none';
    } else e.currentTarget.focus();
  });
}

function setChecklistCallbacks (checklist) {
  setChecklistOnclick(checklist);
  setChecklistOnblur(checklist);
}

function createTranslatorSelect () {
  const translatorSelectContainer = document.createElement('div');
  translatorSelectContainer.appendChild(createTransSelectLabel());
  translatorSelectContainer.appendChild(createTransSelectChecklist());
  return translatorSelectContainer;
}

function createTransSelectDefaultText () {
  const defaultText = document.createElement('span');
  defaultText.className = 'anchor';
  defaultText.innerHTML = '<i class="fa fa-users" aria-hidden="true"></i>';
  return defaultText;
}

function createTransSelectChecklistItems () {
  const items = document.createElement('ul');
  items.id = 'items';
  items.className = 'items';
  return items;
}

function createTransSelectLabel () {
  const translatorSelectLabel = document.createElement('span');
  translatorSelectLabel.className = 'optionLabel';
  translatorSelectLabel.innerHTML = 'User Filter:&nbsp';
  return translatorSelectLabel;
}

function createTransSelectChecklist () {
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

function createSliderLabel (labelText) {
  const label = document.createElement('span');
  label.className = 'optionLabel';
  label.textContent = labelText;
  return label;
}

async function createSliderInput (id, min, max,
  getSliderValue, setSliderValue,
  onchange, toScale) {
  const slider = document.createElement('input');
  slider.id = id;
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.style.padding = '4px';
  slider.step = '0.01';
  slider.value = (await getSliderValue()) || (isAndroid ? 0.5 : 1);
  slider.style.verticalAlign = 'middle';
  slider.addEventListener('change', async () => {
    const s = await updateSliderLevel(id, getSliderValue, setSliderValue, toScale);
    await onchange(s);
  });

  return slider;
}

async function updateSliderLevel (id, getSliderValue,
  setSliderValue, toScale = true) {
  const value = parseFloat(document.getElementById(id).value) || await getSliderValue() || 1;
  const scale = Math.ceil(value * 100);
  const container = document.body;// document.querySelector('.bodyWrapper');
  const transform = `scale(${scale / 100})`;
  const inverse = 10000 / scale;
  const newWidth = `${inverse}%`;
  const newHeight = `${inverse}%`;
  if (toScale) {
    container.style.transformOrigin = '0 0';
    container.style.width = newWidth;
    container.style.height = newHeight;
    container.style.transform = transform;
  }
  await setSliderValue(scale / 100);
  return {
    type: 'zoom',
    zoom: {
      width: container.style.width,
      height: container.style.height,
      transform: container.style.transform
    }
  };
}

function createSliderResetButton (id, getSliderValue,
  setSliderValue, onchange,
  toScale) {
  const resetButton = document.createElement('input');
  resetButton.value = 'Reset';
  resetButton.style.marginLeft = '4px';
  resetButton.style.verticalAlign = 'middle';
  resetButton.type = 'button';
  resetButton.addEventListener('click', async () => {
    document.getElementById(id).value = (isAndroid ? 0.5 : 1);
    const s = await updateSliderLevel(id, getSliderValue, setSliderValue, toScale);
    await onchange(s);
  });
  return resetButton;
}

async function createSlider (id, min, max, labelText,
  getSliderValue, setSliderValue,
  onchange, toScale = true) {
  const settings = document.createElement('div');

  settings.appendChild(createSliderLabel(labelText));
  settings.appendChild(await createSliderInput(
    id, min, max, getSliderValue, setSliderValue, onchange, toScale
  ));
  settings.appendChild(createSliderResetButton(
    id, getSliderValue, setSliderValue, onchange, toScale
  ));

  return settings;
}

function postToParent (s) {
  window.parent.postMessage(s, '*');
}

async function createGenericZoomSlider (id, labelText,
  getSliderValue,
  setSliderValue,
  onchange,
  toScale = true) {
  return createSlider(
    id,
    isAndroid ? '0.25' : '0.5',
    isAndroid ? '1.5' : '2',
    labelText,
    getSliderValue,
    setSliderValue,
    onchange,
    toScale
  );
}

async function createZoomSlider () {
  return createGenericZoomSlider(
    'zoomSliderInput',
    'Zoom: ',
    () => getStorage('zoom'),
    (value) => setStorage('zoom', value),
    postToParent
  );
}

// Needed for compatibility issues in frame.js
async function updateZoomLevel () {
  postToParent(
    await updateSliderLevel(
      'zoomSliderInput',
      () => getStorage('zoom'),
      (value) => setStorage('zoom', value)
    )
  );
}

async function createCaptionZoomSlider () {
  return createGenericZoomSlider(
    'captionZoomSliderInput',
    'Caption Zoom: ',
    getCaptionZoom,
    setCaptionZoom,
    postToParent,
    false
  );
}

function createTimestampLabel () {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.htmlFor = 'timestampToggle';
  label.textContent = 'Show Timestamps: ';

  return label;
}

async function createTimestampCheckbox () {
  const timestampToggle = document.createElement('input');
  timestampToggle.id = 'timestampToggle';
  timestampToggle.type = 'checkbox';
  timestampToggle.style.padding = '4px';
  timestampToggle.style.verticalAlign = 'middle';

  let display = await getStorage('timestamp');
  display = display != null ? display : true;
  timestampToggle.checked = display;

  const changed = async () => {
    showTimestamps = timestampToggle.checked;
    await setStorage('timestamp', showTimestamps);
    document.querySelectorAll('.timestampText').forEach(m => m.style.display = showTimestamps ? 'contents' : 'none');
  };

  timestampToggle.addEventListener('change', changed);

  await changed();

  return timestampToggle;
}

async function createTimestampToggle () {
  const timestampSettings = document.createElement('div');
  timestampSettings.appendChild(createTimestampLabel());
  timestampSettings.appendChild(await createTimestampCheckbox());
  return timestampSettings;
}

function createTextDirectionLabel () {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.htmlFor = 'textDirToggle';
  label.textContent = 'Text Direction: ';

  return label;
}

async function createTextDirectionSelect () {
  const textDirSelect = document.createElement('select');
  textDirSelect.innerHTML = `
    <option id="top" value="top">Top</option>
    <option id="bottom" value="bottom">Bottom</option>
  `;

  let data = (await getStorage('text_direction'));
  data = (data == null ? 'bottom' : data);
  textDirSelect.value = textDirection = data;

  const changed = async () => {
    textDirection = textDirSelect.value;
    await setStorage('text_direction', textDirection);
    const tt = document.querySelector('.translationText');
    const sg = document.querySelector('#settingsGear');
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

async function createTextDirectionToggle (container) {
  const textDirToggle = document.createElement('div');
  textDirToggle.appendChild(createTextDirectionLabel());
  textDirToggle.appendChild(await createTextDirectionSelect(container));
  textDirToggle.style.marginTop = '10px';
  return textDirToggle;
}

function createChatSideLabel () {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.textContent = 'Chat side: ';

  return label;
}

async function createChatSideRadios () {
  const left = document.createElement('input');
  const right = document.createElement('input');
  const portrait = document.createElement('input');

  left.id = 'chatSideLeft';
  right.id = 'chatSideRight';
  portrait.id = 'chatSidePortrait';

  left.type = right.type = portrait.type = 'radio';
  left.name = right.name = portrait.name = 'chatSide';

  const side = await getStorage('chatSide');

  if (side === 'right') {
    right.checked = true;
  } else if (side === 'left') {
    left.checked = true;
  } else {
    right.checked = true;
  }

  const onChange = async () => {
    const side = left.checked ? 'left' : 'right';
    await setStorage('chatSide', side);
    try {
      if (portrait.checked) {
        await window.parent.orientationChanged('portrait');
      } else {
        await window.parent.orientationChanged('landscape');
      }
    } catch (e) { }
  };

  left.addEventListener('change', onChange);
  right.addEventListener('change', onChange);
  portrait.addEventListener('change', onChange);

  return { left, right, portrait };
}

function createChatSideRadioLabels () {
  const left = document.createElement('label');
  const right = document.createElement('label');
  const portrait = document.createElement('label');

  left.htmlFor = 'chatSideLeft';
  right.htmlFor = 'chatSideRight';
  portrait.htmlFor = 'chatSidePortrait';

  left.textContent = 'Left';
  right.textContent = 'Right';
  portrait.textContent = 'Portrait';

  return { left, right, portrait };
}

async function createChatSideToggle () {
  const chatSideToggle = document.createElement('div');
  chatSideToggle.appendChild(createChatSideLabel());

  const radios = await createChatSideRadios();
  const labels = createChatSideRadioLabels();

  chatSideToggle.appendChild(radios.left);
  chatSideToggle.appendChild(labels.left);
  chatSideToggle.appendChild(radios.right);
  chatSideToggle.appendChild(labels.right);
  chatSideToggle.appendChild(radios.portrait);
  chatSideToggle.appendChild(labels.portrait);

  return chatSideToggle;
}

function createCheckToggleLabel (labelName, labelFor) {
  const label = document.createElement('label');
  label.className = 'optionLabel';
  label.htmlFor = labelFor;
  label.textContent = labelName;
  return label;
}

async function createCheckToggleCheckbox (id, storageName, onchange) {
  const checkbox = document.createElement('input');
  checkbox.id = id;
  checkbox.type = 'checkbox';
  checkbox.style.padding = '4px';
  checkbox.style.verticalAlign = 'middle';

  const display = await getStorage(storageName);
  checkbox.checked = display != null ? display : true;

  const changed = async () => {
    const toDisplay = checkbox.checked;
    await setStorage(storageName, toDisplay);
    await onchange();
  };

  checkbox.addEventListener('change', changed);

  await changed();

  return checkbox;
}

function createDisplayModMessageLabel () {
  return createCheckToggleLabel('Show Mod Messages: ', 'displayModMessages');
}

async function createDisplayModMessageCheckbox () {
  return await createCheckToggleCheckbox(
    'displayModMessages', 'displayModMessages', async () => {
      const displayModMessages = await getStorage('displayModMessages');
      document.querySelectorAll('.mod').forEach(el => {
        el.parentElement
          .parentElement
          .style
          .display = displayModMessages ? 'block' : 'none';
      });
    }
  );
}

async function createDisplayModMessageToggle () {
  const displayModMessagesToggle = document.createElement('div');
  displayModMessagesToggle.appendChild(createDisplayModMessageLabel());
  displayModMessagesToggle.appendChild(await createDisplayModMessageCheckbox());

  return displayModMessagesToggle;
}

function changeThemeAndRedirect (dark) {
  let url = new URL(location.href);
  url.searchParams.set('dark_theme', dark);
  location.href = url.toString();
}

function closeMessageSelector (container) {
  container.style.display = null;
  document.querySelector('#chat').style.cursor = null;
  document.querySelector('#settingsGear').classList.remove('pickUserDoneBtn');
  scrollBackToBottomOfChat();
}

function findParent (e) {
  while (e && e.tagName != 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') e = e.parentElement;
  return e;
}

function scrollBackToBottomOfChat () {
  document.querySelector('#show-more').dispatchEvent(new Event('click'));
}

function asyncPrompt (text, value) {
  value = value || '';
  if (!isAndroid) {
    return prompt(text, value);
  } else {
    return new Promise((res, rej) => {
      window.parent.promptCallback = d => res(decodeURIComponent(d));
      window.Android.prompt(text, value);
    });
  }
}

function createCustomUserButton (container) {
  const addButton = document.createElement('input');
  addButton.value = 'Add User to Filter';
  addButton.style.verticalAlign = 'middle';
  addButton.type = 'button';
  addButton.addEventListener('click', async () => {
    let name = await asyncPrompt(
      'Please enter a username. ' +
      'Users you add will be filtered automatically in all future streams if they are present. ' +
      'Otherwise, they will not be displayed in the user list.'
    );
    if (name) {
      name = name.trim().toLowerCase();
      await saveUserStatus(name, true, undefined, true);
      await createCheckbox(`(Custom) ${name}`, name, true, undefined, async (e) => {
        await saveUserStatus(name, e.target.checked, undefined, true);
      }, true);
    }
  });
  return addButton;
}

async function createCaptionDisplayToggle () {
  await setupDefaultCaption();
  const captionDispToggle = document.createElement('div');
  captionDispToggle.appendChild(createCaptionDisplayToggleLabel());
  captionDispToggle.appendChild(await createCaptionDisplayToggleCheckbox());
  return captionDispToggle;
}

function createCaptionDisplayToggleLabel () {
  return createCheckToggleLabel('Caption Mode: ', 'captionMode');
}

async function createCaptionDisplayToggleCheckbox () {
  return await createCheckToggleCheckbox(
    'captionMode', 'captionMode', async () => {
      const postMessage = window.parent.parent.postMessage;
      if ((await getStorage('captionMode'))) {
        postMessage({
          action: 'caption',
          caption: `
            Captions will appear here. Try moving and resizing!
            You can also disable it in the settings menu.
          `
        });
      } else {
        postMessage({ action: 'clearCaption' }, '*');
      }
    }
  );
}

async function createCaptionDuration () {
  const captionDuration = document.createElement('div');
  captionDuration.appendChild(createCaptionDurationInputLabel());
  captionDuration.appendChild(await createCaptionDurationInput());
  captionDuration.appendChild(createCaptionTimeoutDesc());
  return captionDuration;
}

function createCaptionDurationInputLabel () {
  return createCheckToggleLabel('Caption Timeout: ', 'captionDuration');
}

function createCaptionTimeoutDesc () {
  return createCheckToggleLabel(' secs. (-1 = disable)');
}

async function createCaptionDurationInput () {
  await setupDefaultCaptionDelay();
  const delay = await getStorage('captionDelay');
  const input = document.createElement('input');
  input.type = 'number';
  input.min = -1;
  input.value = delay;
  input.style.width = '50px';

  const callback = async () => {
    // Remove sticking perma captions if enabling
    if (await getStorage('captionDelay') <= -1) {
      window.parent.parent.postMessage({ action: 'clearCaption' }, '*');
    }
    if (input.value <= -1) input.value = -1;
    setStorage('captionDelay', input.value);
  };

  if (isAndroid) {
    input.addEventListener('click', async (e) => {
      e.preventDefault();
      let val = await asyncPrompt('Caption timeout duration:', input.value.toString());
      val = parseInt(val);
      if (!isNaN(val)) {
        input.value = val;
        callback();
      }
    });
  } else {
    input.addEventListener('change', callback);
  }

  return input;
}

async function createSpeechSynthToggle () {
  await setupDefaultSpeechSynth();
  const speechSynthToggle = document.createElement('div');
  speechSynthToggle.appendChild(createSpeechSynthToggleLabel());
  speechSynthToggle.appendChild(await createSpeechSynthToggleCheckbox());
  unlockSpeech();
  return speechSynthToggle;
}

function createSpeechSynthToggleLabel () {
  return createCheckToggleLabel('Read Aloud TLs:', 'speechSynth');
}

async function createSpeechSynthToggleCheckbox () {
  return await createCheckToggleCheckbox(
    'speechSynth', 'speechSynth', async () => {
      if (await shouldSpeak()) {
        await speak('Read aloud enabled');
      } else {
        await speak('Read aloud disabled');
      }
    }
  );
}

// still asyncronous so await the result
function createTranslatorModeToggle () {
  return new Promise((res, rej) => {
    setTimeout(async () => {
      try {
        await setupDefaultTranslatorMode();
        const transModeToggle = document.createElement('div');
        transModeToggle.appendChild(createTranslatorModeToggleLabel());
        transModeToggle.appendChild(await createTranslatorModeToggleCheckbox());
        res(transModeToggle);
      } catch (e) {
        rej(e);
      }
    }, 0);
  });
}

function createTranslatorModeToggleLabel () {
  return createCheckToggleLabel('Auto-Prefix Chat Messages:', 'translatorMode');
}

async function createTranslatorModeToggleCheckbox () {
  return await createCheckToggleCheckbox(
    'translatorMode', 'translatorMode', async () => {
      if (await TranslatorMode.enabled()) {
        TranslatorMode.reload();
      } else {
        TranslatorMode.disable();
      }
    }
  );
}

module.exports = { createSettings };
