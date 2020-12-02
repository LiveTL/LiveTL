function conlog(...args) {
    if (params.devMode) {
        return console.log(...args);
    }
}
const isFirefox = /Firefox/.exec(navigator.userAgent) ? true : false;

let languageConversionTable = {};

// WAR: web accessible resource
async function getWAR(u) {
    return new Promise((res, rej) => chrome.runtime.sendMessage({ type: "get_war", url: u }, r => res(r)));
}

async function getFile(name, format) {
    return await (await fetch(await getWAR(name)))[format]();
}

// global helper function to handle scrolling
function updateSize() {
    let pix = document.querySelector(".dropdown-check-list").getBoundingClientRect().bottom;
    document.querySelector(".modal").style.height = pix + "px";
}

let allTranslators = { v: {} };
let allTranslatorCheckbox = {};

async function runLiveTL() {
    await setFavicon();

    switchChat();
    setTimeout(async () => {
        document.title = "LiveTL Chat";

        await Promise.all([importFontAwesome(), importStyle()]);

        let livetlContainer = document.createElement("div");
        livetlContainer.className = "livetl";
        document.body.appendChild(livetlContainer);
        if (params.devMode) {
            livetlContainer.style.opacity = "50%";
        }
        let translationDiv = document.createElement("div");
        translationDiv.className = "translationText";

        let settings = createSettings(livetlContainer);
        livetlContainer.appendChild(translationDiv);

        allTranslatorCheckbox = createCheckbox("All Translators", "allTranslatorID", true, () => {
            let boxes = document
                .querySelector("#transelectChecklist")
                .querySelectorAll("input:not(:checked)");
            boxes.forEach(box => box.checked = allTranslatorCheckbox.checked);
            checkboxUpdate();
        });

        prependE = el => translationDiv.prepend(el);

        prependE(await createWelcome());

        setInterval(() => {
            let messages = document.querySelectorAll(".yt-live-chat-text-message-renderer > #message");
            let i = 0;
            while (i < messages.length && messages[i].innerHTML == "") i++;
            for (; i < messages.length; i++) {
                let m = messages[i];
                if (m.innerHTML == "") break;
                let parsed = parseTranslation(m.textContent);
                let select = document.querySelector("#langSelect");
                if (parsed != null && isLangMatch(parsed.lang.toLowerCase(), languageConversionTable[select.value])
                    && parsed.msg.replace(/\s/g, '') != "") {
                    let author = m.parentElement.childNodes[1].textContent;
                    let authorID = /\/ytc\/([^\=]+)\=/.exec(getProfilePic(m))[1];
                    let line = createTranslationElement(author, authorID, parsed.msg);
                    if (!(authorID in allTranslators.v)) {
                        createCheckbox(author, authorID, allTranslatorCheckbox.checked);
                    }
                    if (allTranslators.v[authorID].checked) {
                        prependE(line);
                    }
                }
                m.innerHTML = "";
            }
            createSettingsProjection(prependE);
        }, 1000);
    }, 100);
}

function switchChat() {
    let count = 2;
    document.querySelectorAll(".yt-dropdown-menu").forEach((e) => {
        if (/Live chat/.exec(e.innerText) && count > 0) {
            e.click();
            count--;
        }
    });
};

function parseParams() {
    let s = decodeURI(location.search.substring(1))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
    return s == "" ? {} : JSON.parse('{"' + s + '"}');
}

async function insertLiveTLButtons(isHolotools = false) {
    conlog("Inserting LiveTL Launcher Buttons");
    params = parseParams();
    makeButton = (text, callback, color) => {
        let a = document.createElement("span");
        a.appendChild(getLiveTLButton(color));

        let interval2 = setInterval(() => {
            let e = isHolotools ? document.querySelector("#input-panel") : document.querySelector("ytd-live-chat-frame");
            if (e != null) {
                clearInterval(interval2);
                e.appendChild(a);
                a.querySelector("a").onclick = callback;
                a.querySelector("yt-formatted-string").textContent = text;
            }
        }, 100);
    }

    redirectTab = u => chrome.runtime.sendMessage({ type: "redirect", data: u });
    createTab = u => chrome.runtime.sendMessage({ type: "tab", data: u });

    let u = `${await getWAR("index.html")}?v=${params.v}`;
    makeButton("Watch in LiveTL", () => redirectTab({ url: u }));
    makeButton("Pop Out Translations", () => createWindow({
        url: `https://www.youtube.com/live_chat?v=${params.v}&useLiveTL=1`,
        type: "popup",
        focused: true
    }), "rgb(143, 143, 143)");
}

let params = {};
let activationInterval = setInterval(() => {
    if (window.location.href.startsWith("https://www.youtube.com/live_chat")) {
        clearInterval(activationInterval);
        conlog("Using live chat");
        try {
            params = parseParams();
            if (params.useLiveTL) {
                conlog("Running LiveTL!");
                runLiveTL();
            } else if (params.embed_domain == "hololive.jetri.co") {
                insertLiveTLButtons(true);
            }
        } catch (e) { }
    } else if (window.location.href.startsWith("https://www.youtube.com/watch")) {
        clearInterval(activationInterval);
        conlog("Watching video");
        let interval = setInterval(() => {
            if (document.querySelector("ytd-live-chat-frame")) {
                clearInterval(interval);
                insertLiveTLButtons();
            }
        }, 100);
    }
}, 1000);

if (window.location.href.startsWith("https://kentonishi.github.io/LiveTL/about")) {
    window.onload = () => {
        let e = document.querySelector("#actionMessage");
        e.textContent = `Thank you for installing LiveTL!`;
    }
}

function createModal(container) {
    let settingsButton = document.createElement("div");
    settingsGear(settingsButton);
    settingsButton.id = "settingsGear";
    settingsButton.style.zIndex = 1000000;
    settingsButton.style.padding = "5px";
    settingsButton.style.width = "24px";

    let modalContainer = document.createElement("div");
    modalContainer.className = "modal";
    modalContainer.style.zIndex = 1000000;
    modalContainer.style.width = "calc(100% - 20px);";
    modalContainer.style.display = "none";

    let modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    let nextStyle = {
        "flex": "none",
        "none": "flex",
    };

    let icon = {
        "flex": closeSVG,
        "none": settingsGear,
    };


    settingsButton.addEventListener("click", (e) => {
        let newDisplay = nextStyle[modalContainer.style.display];
        modalContainer.style.display = newDisplay;
        icon[newDisplay](settingsButton);
        if (newDisplay == "none") {
            document.querySelector(".translationText").style.display = "block";
            modalContainer.style.height = "auto";
        } else {
            document.querySelector(".translationText").style.display = "none";
            updateSize();
        }
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
    select.onfocus = () => select.value = "";
    select.onblur = () => {
        if (!(select.value in languageConversionTable)) {
            select.value = defaultValue;
        }
    };
}

function createLangSelectionName(lang) {
    return `${lang.name} (${lang.lang}) [${lang.code}]`;
}

function createLangSelectOption(lang) {
    let opt = document.createElement("option");
    opt.value = createLangSelectionName(lang);
    return opt;
}

languages.forEach(i => languageConversionTable[createLangSelectionName(i)] = i);

function createLangSelectLabel() {
    let langSelectLabel = document.createElement("span");
    langSelectLabel.className = "optionLabel";
    langSelectLabel.textContent = "Language: ";
    return langSelectLabel;
}

function createSelectInput() {
    let select = document.createElement("input");
    select.dataset.role = "none";
    let defaultLang = languages[0];
    select.value = `${defaultLang.name} (${defaultLang.lang}) [${defaultLang.code}]`;
    select.setAttribute("list", "languages");
    select.id = "langSelect";
    setSelectInputCallbacks(select, select.value);
    return select;
}

function createLangSelectDatalist() {
    let datalist = document.createElement("datalist");
    datalist.id = "languages";
    let appendDatalist = e => datalist.appendChild(e);
    languages.map(createLangSelectOption).map(appendDatalist);
    return datalist;
}

function createLanguageSelect() {
    let langSelectContainer = document.createElement("div");
    langSelectContainer.appendChild(createLangSelectLabel());
    langSelectContainer.appendChild(createSelectInput());
    langSelectContainer.appendChild(createLangSelectDatalist());
    return langSelectContainer;
}

function setChecklistOnclick(checklist) {
    checklist.querySelector('.anchor').onclick = () => {
        let items = checklist.querySelector("#items");
        if (items.style.display != "block") {
            checklist.classList.add("openList");
            items.style.display = "block";
        }
        else {
            checklist.classList.remove("openList");
            items.style.display = "none";
        }
        updateSize();
    }
}

function setChecklistOnblur(checklist) {
    checklist.onblur = e => {
        let items = document.querySelector("#items");
        if (!e.currentTarget.contains(e.relatedTarget)) {
            checklist.classList.remove("openList");
            items.style.display = "none";
        }
        else e.currentTarget.focus();
        updateSize();
    }
}

function setChecklistCallbacks(checklist) {
    setChecklistOnclick(checklist);
    setChecklistOnblur(checklist);
}

function createTransSelectDefaultText() {
    let defaultText = document.createElement("span");
    defaultText.className = "anchor";
    defaultText.textContent = "View All";
    return defaultText;
}

function createTransSelectChecklistItems() {
    let items = document.createElement("ul");
    items.id = "items";
    items.className = "items";
    return items;
}

function createTransSelectLabel() {
    let translatorSelectLabel = document.createElement("span");
    translatorSelectLabel.className = "optionLabel";
    translatorSelectLabel.innerHTML = "Translators:&nbsp";
    return translatorSelectLabel;
}

function createTransSelectChecklist() {
    let checklist = document.createElement("div");
    checklist.className = "dropdown-check-list";
    checklist.id = "transelectChecklist";
    checklist.tabIndex = 1;
    checklist.appendChild(createTransSelectDefaultText());
    checklist.appendChild(createTransSelectChecklistItems());
    setChecklistCallbacks(checklist);
    return checklist;
}

function createTranslatorSelect() {
    let translatorSelectContainer = document.createElement("div");
    translatorSelectContainer.appendChild(createTransSelectLabel());
    translatorSelectContainer.appendChild(createTransSelectChecklist());
    return translatorSelectContainer;
}

function createSettings(container) {
    let settings = createModal(container);
    settings.appendChild(createLanguageSelect());
    settings.appendChild(createTranslatorSelect());
    return settings;
}

function wrapIconWithLink(icon, link) {
    let wrapper = document.createElement("a");
    wrapper.href = link;
    wrapper.target = "about:blank";
    wrapper.appendChild(icon);
    return wrapper;
}

async function createLogo() {
    let a = document.createElement("a");
    a.href = "https://kentonishi.github.io/LiveTL/about/";
    a.target = "about:blank";
    let logo = document.createElement("img");
    logo.className = "logo";
    logo.src = await getWAR("icons/favicon.ico");
    a.appendChild(logo);
    return a;
}

function createIcon(faName, link, addSpace) {
    let icon = document.createElement("i");
    ["fa", "smallIcon", faName].forEach(c => icon.classList.add(c));
    let wrapped = wrapIconWithLink(icon, link);
    return wrapped;
}

async function shareExtension() {
    let details = getFile("manifest.json", "json");
    navigator.share({
        title: details.name,
        text: details.description,
        url: "https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg",
    });
}

function createWelcomeText() {
    let welcomeText = document.createElement("span");
    welcomeText.textContent = `Welcome to LiveTL! Translations will appear above.`;
    let buttons = document.createElement("div");
    buttons.classList.add("authorName");
    buttons.style.marginLeft = "0px";
    buttons.innerHTML = `
        Please consider
        <a id="shareExtension" href="javascript:void(0);">sharing LiveTL with your friends</a>, 
        <a href="https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg" target="about:blank">giving us a 5-star review</a>, 
        <a href="https://discord.gg/uJrV3tmthg" target="about:blank">joining our Discord server</a>, and
        <a href="https://github.com/KentoNishi/LiveTL" target="about:blank">starring our GitHub repository</a>!
    `;
    welcomeText.appendChild(buttons);
    welcomeText.querySelector("#shareExtension").onclick = shareExtension;
    return welcomeText;
}

async function createWelcome() {
    let welcome = document.createElement("div");
    welcome.className = "line";
    welcome.appendChild(await createLogo());
    welcome.appendChild(createIcon("fa-discord", "https://discord.gg/uJrV3tmthg", false));
    welcome.appendChild(createIcon("fa-github", "https://github.com/KentoNishi/LiveTL", true));
    welcome.appendChild(createWelcomeText());
    return welcome;
}

function getChecklist() {
    return document.querySelector("#transelectChecklist");
}

function getChecklistItems() {
    return getChecklist().querySelector("#items");
}

function createCheckmark(authorID, checked, onchange) {
    let checkmark = document.createElement("input");
    checkmark.type = "checkbox";
    checkmark.dataset.id = authorID;
    checkmark.checked = checked;
    checkmark.onchange = onchange;
    return checkmark;
}

function createCheckboxPerson(name, authorID) {
    let person = document.createElement("label");
    person.setAttribute("for", authorID);
    person.textContent = name;
    return person;
}

function createCheckbox(name, authorID, checked = false, callback = null) {
    let items = getChecklistItems();
    let checkbox = createCheckmark(authorID, checked, callback || checkboxUpdate);
    let selectTranslatorMessage = document.createElement("li");
    selectTranslatorMessage.appendChild(checkbox);
    selectTranslatorMessage.appendChild(createCheckboxPerson(name, authorID));
    items.appendChild(selectTranslatorMessage);
    checkboxUpdate();
    return checkbox;
}

function filterBoxes(boxes) {
    boxes.forEach((box) => {
        allTranslators.v[box.dataset.id] = box;
        if (box != allTranslatorCheckbox && !box.checked) {
            allTranslatorCheckbox.checked = false;
        }
    });
}

function checkAll() {
    let boxes = getChecklist().querySelectorAll("input:not(:checked)");
    boxes.forEach(box => box.checked = true);
}

function removeBadTranslations() {
    document.querySelectorAll(".line").forEach((translation, i) => {
        // if (i > 25) {
        //     translation.remove();
        // } else 
        // removed limiting
        if (author = translation.querySelector(".authorName")) {
            if (author.dataset.id && !allTranslators.v[author.dataset.id].checked) {
                translation.remove();
            }
        }
    });
}

function checkboxUpdate() {
    let boxes = getChecklist().querySelectorAll("input");
    allTranslators.v = {};
    filterBoxes(boxes);
    if (allTranslatorCheckbox.checked) {
        checkAll();
    }
    removeBadTranslations();
}

function createAuthorNameElement(author, authorID) {
    let authorName = document.createElement("span");
    authorName.textContent = author;
    authorName.dataset.id = authorID;
    authorName.className = "authorName";
    return authorName;
}

function createAuthorHideButton(translation) {
    let hide = document.createElement("span");
    hide.style.cursor = "pointer";
    hide.onclick = () => translation.remove();
    hideSVG(hide);
    return hide;
}

function createAuthorBanButton(authorID) {
    let ban = document.createElement("span");
    ban.onclick = () => {
        allTranslators.v[authorID].checked = false;
        checkboxUpdate();
    };
    ban.style.cursor = "pointer";
    banSVG(ban);
    return ban;
}

function createAuthorInfoOptions(authorID, line) {
    let options = document.createElement("span");
    options.appendChild(createAuthorHideButton(line));
    options.appendChild(createAuthorBanButton(authorID));
    options.style.display = "none";
    options.className = "messageOptions";
    return options;
}

function createAuthorInfoElement(author, authorID, line) {
    let authorInfo = document.createElement("span");
    authorInfo.appendChild(createAuthorNameElement(author, authorID));
    authorInfo.appendChild(createAuthorInfoOptions(authorID, line));
    return authorInfo;
}

function setTranslationElementCallbacks(line) {
    line.onmouseover = () => line.querySelector(".messageOptions").style.display = "inline-block";
    line.onmouseleave = () => line.querySelector(".messageOptions").style.display = "none";
}

function createTranslationElement(author, authorID, translation) {
    let line = document.createElement("div");
    line.className = "line";
    line.textContent = translation;
    setTranslationElementCallbacks(line);
    line.appendChild(createAuthorInfoElement(author, authorID, line));
    return line;
}


function getProfilePic(el) {
    return el.parentElement.parentElement.querySelector("img").src;
}

function createSettingsProjection(add) {
    let settingsProjection = document.querySelector("#settingsProjection");
    if (settingsProjection) settingsProjection.remove();
    settingsProjection = document.createElement("div");
    settingsProjection.id = "settingsProjection";
    settingsProjection.style.zIndex = -1;
    add(settingsProjection);
}

async function setFavicon() {
    let favicon = getWAR("icons/favicon.ico");
    let faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.type = "image/x-icon";
    faviconLink.href = await favicon;
    document.head.appendChild(faviconLink);
}

async function createWindow(u) {
    if (isFirefox) {
        return window.open(u.url, "",
            "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300"
        );
    }
    else {
        return chrome.runtime.sendMessage({ type: "window", data: u });
    }
}

// MARK

function styleLiveTLButton(a, color) {
    a.style.backgroundColor = `${color || "rgb(0, 153, 255)"}`;
    a.style.font = "inherit";
    a.style.fontSize = "11px";
    a.style.fontWeight = "bold";
    a.style.width = "100%";
    a.style.margin = 0;
    a.style.textAlign = "center";
}

function setLiveTLButtonAttributes(a) {
    [
        "yt-simple-endpoint",
        "style-scope",
        "ytd-toggle-button-renderer"
    ].forEach(c => a.classList.add(c));
    a.tabindex = "-1";
}

function getLiveTLButton(color) {
    let a = document.createElement("a");
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
    let frameCSSURL = getWAR(url);
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = await frameCSSURL;
    link.type = "text/css";
    document.head.appendChild(link);
}

async function importStyle() {
    return await importCSS("css/frame.css");
}
