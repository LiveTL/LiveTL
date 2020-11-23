const languages = [
    { code: 'ab', name: 'Abkhazian' },
    { code: 'aa', name: 'Afar' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'ak', name: 'Akan' },
    { code: 'sq', name: 'Albanian' },
    { code: 'am', name: 'Amharic' },
    { code: 'ar', name: 'Arabic' },
    { code: 'an', name: 'Aragonese' },
    { code: 'hy', name: 'Armenian' },
    { code: 'as', name: 'Assamese' },
    { code: 'av', name: 'Avaric' },
    { code: 'ae', name: 'Avestan' },
    { code: 'ay', name: 'Aymara' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'bm', name: 'Bambara' },
    { code: 'ba', name: 'Bashkir' },
    { code: 'eu', name: 'Basque' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bh', name: 'Bihari languages' },
    { code: 'bi', name: 'Bislama' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'br', name: 'Breton' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'my', name: 'Burmese' },
    { code: 'ca', name: 'Catalan, Valencian' },
    { code: 'km', name: 'Central Khmer' },
    { code: 'ch', name: 'Chamorro' },
    { code: 'ce', name: 'Chechen' },
    { code: 'ny', name: 'Chichewa, Chewa, Nyanja' },
    { code: 'zh', name: 'Chinese' },
    { code: 'cu', name: 'Church Slavonic, Old Bulgarian, Old Church Slavonic' },
    { code: 'cv', name: 'Chuvash' },
    { code: 'kw', name: 'Cornish' },
    { code: 'co', name: 'Corsican' },
    { code: 'cr', name: 'Cree' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'dv', name: 'Divehi, Dhivehi, Maldivian' },
    { code: 'nl', name: 'Dutch, Flemish' },
    { code: 'dz', name: 'Dzongkha' },
    { code: 'en', name: 'English' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'et', name: 'Estonian' },
    { code: 'ee', name: 'Ewe' },
    { code: 'fo', name: 'Faroese' },
    { code: 'fj', name: 'Fijian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'ff', name: 'Fulah' },
    { code: 'gd', name: 'Gaelic, Scottish Gaelic' },
    { code: 'gl', name: 'Galician' },
    { code: 'lg', name: 'Ganda' },
    { code: 'ka', name: 'Georgian' },
    { code: 'de', name: 'German' },
    { code: 'ki', name: 'Gikuyu, Kikuyu' },
    { code: 'el', name: 'Greek (Modern)' },
    { code: 'kl', name: 'Greenlandic, Kalaallisut' },
    { code: 'gn', name: 'Guarani' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ht', name: 'Haitian, Haitian Creole' },
    { code: 'ha', name: 'Hausa' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hz', name: 'Herero' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ho', name: 'Hiri Motu' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'io', name: 'Ido' },
    { code: 'ig', name: 'Igbo' },
    { code: 'id', name: 'Indonesian' },
    // { code: 'ia', name: 'Interlingua (International Auxiliary Language Association)' },
    { code: 'ie', name: 'Interlingue' },
    { code: 'iu', name: 'Inuktitut' },
    { code: 'ik', name: 'Inupiaq' },
    { code: 'ga', name: 'Irish' },
    { code: 'it', name: 'Italian' },
    { code: 'jp', name: 'Japanese' },
    { code: 'jv', name: 'Javanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kr', name: 'Kanuri' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'kv', name: 'Komi' },
    { code: 'kg', name: 'Kongo' },
    { code: 'ko', name: 'Korean' },
    { code: 'kj', name: 'Kwanyama, Kuanyama' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'ky', name: 'Kyrgyz' },
    { code: 'lo', name: 'Lao' },
    { code: 'la', name: 'Latin' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lb', name: 'Letzeburgesch, Luxembourgish' },
    { code: 'li', name: 'Limburgish, Limburgan, Limburger' },
    { code: 'ln', name: 'Lingala' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lu', name: 'Luba-Katanga' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'ms', name: 'Malay' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mt', name: 'Maltese' },
    { code: 'gv', name: 'Manx' },
    { code: 'mi', name: 'Maori' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mh', name: 'Marshallese' },
    { code: 'ro', name: 'Moldovan, Moldavian, Romanian' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'na', name: 'Nauru' },
    { code: 'nv', name: 'Navajo, Navaho' },
    { code: 'nd', name: 'Northern Ndebele' },
    { code: 'ng', name: 'Ndonga' },
    { code: 'ne', name: 'Nepali' },
    { code: 'se', name: 'Northern Sami' },
    { code: 'no', name: 'Norwegian' },
    { code: 'nb', name: 'Norwegian Bokmål' },
    { code: 'nn', name: 'Norwegian Nynorsk' },
    { code: 'ii', name: 'Nuosu, Sichuan Yi' },
    { code: 'oc', name: 'Occitan (post 1500)' },
    { code: 'oj', name: 'Ojibwa' },
    { code: 'or', name: 'Oriya' },
    { code: 'om', name: 'Oromo' },
    { code: 'os', name: 'Ossetian, Ossetic' },
    { code: 'pi', name: 'Pali' },
    { code: 'pa', name: 'Panjabi, Punjabi' },
    { code: 'ps', name: 'Pashto, Pushto' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'qu', name: 'Quechua' },
    { code: 'rm', name: 'Romansh' },
    { code: 'rn', name: 'Rundi' },
    { code: 'ru', name: 'Russian' },
    { code: 'sm', name: 'Samoan' },
    { code: 'sg', name: 'Sango' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'sc', name: 'Sardinian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sn', name: 'Shona' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'si', name: 'Sinhala, Sinhalese' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'so', name: 'Somali' },
    { code: 'st', name: 'Sotho, Southern' },
    { code: 'nr', name: 'South Ndebele' },
    { code: 'es', name: 'Spanish, Castilian' },
    { code: 'su', name: 'Sundanese' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ss', name: 'Swati' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'ty', name: 'Tahitian' },
    { code: 'tg', name: 'Tajik' },
    { code: 'ta', name: 'Tamil' },
    { code: 'tt', name: 'Tatar' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'bo', name: 'Tibetan' },
    { code: 'ti', name: 'Tigrinya' },
    { code: 'to', name: 'Tonga (Tonga Islands)' },
    { code: 'ts', name: 'Tsonga' },
    { code: 'tn', name: 'Tswana' },
    { code: 'tr', name: 'Turkish' },
    { code: 'tk', name: 'Turkmen' },
    { code: 'tw', name: 'Twi' },
    { code: 'ug', name: 'Uighur, Uyghur' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'uz', name: 'Uzbek' },
    { code: 've', name: 'Venda' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'vo', name: 'Volap_k' },
    { code: 'wa', name: 'Walloon' },
    { code: 'cy', name: 'Welsh' },
    { code: 'fy', name: 'Western Frisian' },
    { code: 'wo', name: 'Wolof' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'yi', name: 'Yiddish' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'za', name: 'Zhuang, Chuang' },
    { code: 'zu', name: 'Zulu' }
];

var languageConversionTable = {};
languages.forEach(i => languageConversionTable[i.name + ` [${i.code}]`] = i);

languages.sort((a, b) => a.code - b.code);

function runLiveTL() {
    switchChat();
    setTimeout(() => {
        let style = document.createElement('style');
        style.innerHTML = `
            .livetl {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--yt-live-chat-background-color);
                color: var(--yt-live-chat-primary-text-color);
                z-index: 69420;
                word-wrap: break-word;
                word-break: break-word;
                font-size: 20px;
                overflow: hidden;
                padding-left: 10px;
                min-height: 0px !important;
                min-width 0px !important;
            }
        `;
        document.getElementsByTagName("head")[0].appendChild(style);
        let e = document.createElement("div");
        let eee = document.createElement("img");
        eee.src = "https://fonts.gstatic.com/s/i/materialiconsoutlined/settings/v7/24px.svg";
        e.className = "livetl";
        document.body.appendChild(e);
        let select = document.createElement("input");
        let datalist = document.createElement("datalist");
        datalist.id = "languages";
        languages.forEach(lang => {
            let opt = document.createElement("option");
            opt.value = lang.name + ` [${lang.code}]`;
            if (lang.code == "en") select.value = opt.value;
            datalist.appendChild(opt);
        });
        document.body.appendChild(datalist);
        // eee.id = "langSelect";
        // eee.style.zIndex = 100000;
        // eee.style.position = "fixed";
        // eee.style.top = 0;
        // eee.style.right = 0;
        // eee.style.padding = "5px";
        // eee.style.width = "5em !important";

        let lastLang = select.value;
        select.id = "langSelect";
        select.setAttribute("list", datalist.id);
        select.style.zIndex = 100000;
        select.style.position = "fixed";
        select.style.top = 0;
        select.style.right = 0;
        select.style.padding = "5px";
        select.style.width = "auto !important";
        select.onblur = () => {
            console.log(lastLang);
            if (!(select.value in languageConversionTable)) {
                select.value = lastLang;
            }
        }
        select.onfocus = () => select.value = "";
        let sd = document.createElement("div");
        // sd.appendChild(select);
        sd.appendChild(select);
        // settings svg: "https://fonts.gstatic.com/s/i/materialiconsoutlined/settings/v7/24px.svg";
        document.body.appendChild(sd);

        setInterval(() => {
            if (select.value in languageConversionTable && select.value != lastLang) e.innerHTML = "";
            let messages = document.querySelectorAll("#message");
            messages.forEach(m => {
                let parsed = /^\[(\w+)\] ?(.+)/.exec(m.textContent);
                if (parsed != null) console.log(parsed);
                if (parsed != null && parsed[1].toLowerCase() == languageConversionTable[select.value].code) {
                    let line = document.createElement("div");
                    line.style.marginBottom = "10px";
                    line.style.marginTop = "10px";
                    line.textContent = parsed[2];
                    e.appendChild(line);
                }
                m.remove();
            });
            if (select.value in languageConversionTable) lastLang = select.value;
            e.scrollTop = e.scrollHeight;
        }, 100);
    }, 100);
}

function switchChat() {
    let count = 2;
    document.querySelectorAll(".yt-dropdown-menu").forEach((e) => {
        if (/Live chat/.exec(e.innerText) && count > 0) {
            e.click();
            count--;
        }
    })
};

function parseParams() {
    let s = decodeURI(location.search.substring(1))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
    return s == "" ? {} : JSON.parse('{"' + s + '"}');
}

window.onload = () => {
    if (parent === top) {
        try {
            let params = parseParams();
            if (params.useLiveTL) {
                console.log("Running LiveTL!");
                runLiveTL();
            }
        } catch (e) {
        }
    }
}
