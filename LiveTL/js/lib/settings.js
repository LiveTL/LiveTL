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
  settings.appendChild(await createZoomSlider())
  settings.appendChild(await createTimestampToggle());
  settings.appendChild(await createTextDirectionToggle(container));
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
      window.updateDimensions(true, textDirection == 'top');
    } else {
      document.querySelector('.translationText').style.display = 'none';
      updateSettingsPanelSize();
    }

    if (enableDarkModeToggle) {
      let previousTheme = await getStorage('theme');
      let themeToggle = document.querySelector("#darkThemeToggle");
      if (themeToggle.value != previousTheme) {
        let dark = themeToggle.value == 'dark' ? 1 : 0;
        await setStorage('theme', themeToggle.value);
        window.parent.postMessage({ type: "themeChange", "darkTheme": dark }, "*");
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
    updateSettingsPanelSize();
  };
}

function setChecklistOnblur(checklist) {
  checklist.onblur = e => {
    const items = checklist.querySelector('#items');
    if (!e.currentTarget.contains(e.relatedTarget)) {
      checklist.classList.remove('openList');
      items.style.display = 'none';
    } else e.currentTarget.focus();
    updateSettingsPanelSize();
  };
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

  timestampToggle.onchange = async () => {
    showTimestamps = timestampToggle.checked;
    await setStorage('timestamp', showTimestamps);
    document.querySelectorAll('.timestampText').forEach(m => m.style.display = showTimestamps ? 'contents' : 'none');
  };

  await timestampToggle.onchange();

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

async function createTextDirectionSelect(container) {
  let textDirSelect = document.createElement('select');
  textDirSelect.innerHTML = `
    <option id="top" value="top">Top</option>
    <option id="bottom" value="bottom">Bottom</option>
  `;

  let data = (await getStorage('text_direction'));
  data = (data == null ? 'bottom' : data);
  textDirSelect.value = textDirection = data;

  textDirSelect.onchange = async () => {
    textDirection = textDirSelect.value;
    await setStorage('text_direction', textDirection);
    let tt = document.querySelector('.translationText');
    let sg = document.querySelector('#settingsGear');
    let modal = document.querySelector(".modal-content");
    tt.querySelectorAll('.line').forEach(m => prependE(m));
    if (textDirection == 'top') {
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

  await textDirSelect.onchange();
  return textDirSelect;
}

async function createTextDirectionToggle(container) {
  const textDirToggle = document.createElement('div');
  textDirToggle.appendChild(createTextDirectionLabel());
  textDirToggle.appendChild(await createTextDirectionSelect(container));
  textDirToggle.style.marginTop = '10px';
  return textDirToggle;
}

function changeThemeAndRedirect(dark) {
  var url = new URL(location.href);
  url.searchParams.set('dark_theme', dark);
  location.href = url.toString();
}

