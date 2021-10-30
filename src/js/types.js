/** @typedef {{type: 'text', text: String}} TextMessage */
/** @typedef {{type: 'link', url: String, text: String}} LinkMessage */
/** @typedef {{type: 'emote', src: String}} EmoteMessage */
/** @typedef {TextMessage | LinkMessage | EmoteMessage} MessageItem */
/** @typedef {{text: String, messageArray: MessageItem[], author: String, timestamp: String, types: Number, authorId: string, messageId: string, timestampMs: number, langCode: String | null}} Message */

/** @typedef {Number} Seconds */
/** @typedef {Number} UnixTimestamp */
/** @typedef {String} HexColor */
/** @typedef {{Stext: String, Stime: UnixTimestamp, CC: HexColor, OC: HexColor}} MCHADTL */
/** @typedef {MCHADTL & {flag: String}} MCHADStreamItem */

/** @typedef {String} Nickname */
/** @typedef {String} StreamTitle */
/** @typedef {{StreamLink: String, videoId: String, Tags: String}} MCHADRoom */
/** @typedef {MCHADRoom & {Nick: Nickname, EntryPass: Boolean, Empty: Boolean}} MCHADLiveRoom */
/** @typedef {MCHADRoom & {Room: Nickname, Link: String, Nick: StreamTitle, Pass: Boolean, Star: Number}} MCHADArchiveRoom */

/** @typedef {Message & {unix: String}} ScriptMessage */
/** @typedef {{id: Number, videoId: String, translatorId: String, languageCode: String, translatedText: String, start: Number, end: Number | null}} APITranslation */
