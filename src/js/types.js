/** @typedef {{type: 'text', text: String}} TextMessage */
/** @typedef {{type: 'link', url: String, text: String}} LinkMessage */
/** @typedef {{type: 'emote', src: String}} EmoteMessage */
/** @typedef {TextMessage | LinkMessage | EmoteMessage} MessageItem */
/** @typedef {{text: String, messageArray: MessageItem[], author: String, timestamp: String, types: Number, authorId: string, messageId: string}} Message */

/** @typedef {Number} Seconds */
/** @typedef {Number} UnixTimestamp */
/** @typedef {String} HexColor */
/** @typedef {{Stext: String, Stime: UnixTimestamp, CC: HexColor, OC: HexColor}} MCHADTL */
/** @typedef {MCHADTL & {flag: String}} MCHADStreamItem */

/** @typedef {String} Nickname */
/** @typedef {String} StreamTitle */
/** @typedef {{Nick: Nickname, EntryPass: Boolean, Empty: Boolean, StreamLink: String, videoId: String}} MCHADLiveRoom */
/** @typedef {{Room: Nickname, Link: String, Nick: StreamTitle, Pass: Boolean, Tags: String, StreamLink: String, Star: Number, videoId: String}} MCHADArchiveRoom */

/** @typedef {Message & {unix: String}} ScriptMessage */
/** @typedef {{id: Number, videoId: String, translatorId: String, languageCode: String, translatedText: String, start: Number, end: Number | null}} APITranslation */
