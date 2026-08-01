/** @typedef {{type: 'text', text: String}} TextMessage */
/** @typedef {{type: 'link', url: String, text: String}} LinkMessage */
/** @typedef {{type: 'emote', src: String}} EmoteMessage */
/** @typedef {TextMessage | LinkMessage | EmoteMessage} MessageItem */
/** @typedef {{text: String, messageArray: MessageItem[], author: String, timestamp: String, types: Number, authorId: string, messageId: string, timestampMs: number, langCode: String | null}} Message */

/** @typedef {Number} Seconds */
/** @typedef {(millis: Number) => String} UnixTransformer */

/** @typedef {Message & {unix: String}} ScriptMessage */
/** @typedef {{id: Number, videoId: String, translatorId: String, languageCode: String, translatedText: String, start: Number, end: Number | null}} APITranslation */
/** @typedef {{ langCode: string, startTime: number }} ScriptMeta */
