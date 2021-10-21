import { readable, derived } from 'svelte/store';
import { combineStores, sources } from './sources.js';
import { getSpamAuthors, removeDuplicateMessages } from './sources-util.js';
import {
  ytcDeleteBehaviour,
  sessionHidden,
  spotlightedTranslator,
  channelFilters,
  mchadUsers,
  spamMsgAmount,
  spamMsgInterval,
  enableSpamProtection,
  spammersDetected,
  disableSpecialSpamProtection
} from './store.js';
import { defaultCaption, YtcDeleteBehaviour, GIGACHAD } from './constants.js';
import { checkAndSpeak } from './speech.js';

/** @typedef {import('svelte/store').Readable} Readable */

/**
 * @template {T}
 * @type {(store: Readable<T>, getBool: (val: T) => Boolean) => Readable<String[]>}
 */
const lookupStoreToList = (store, getBool = Boolean) => derived(store, $val => $val
  .filter(([_id, val]) => getBool(val))
  .map(([id, _val]) => id)
);

/**
 * @template {T}
 * @type {(stores: Readable<T[]>) => Readable<Set<T>>}
 */
const toSet = (...stores) => derived(stores, ($stores) => new Set($stores.flat()), new Set([]));

const channelBlacklisted = lookupStoreToList(channelFilters, f => f.blacklist);
const mchadBlacklisted = lookupStoreToList(mchadUsers);
const notSpammer = lookupStoreToList(spammersDetected, f => !f.spam);

export const allBanned = toSet(channelBlacklisted, mchadBlacklisted);
export const notSpamStore = toSet(notSpammer);

/** @type {Readable<(authorId: String) => Boolean>} */
const whitelistedSpam = derived(notSpamStore, $set => id => $set.has(id));

/** @type {([authorId: String, author: String]) => Void} */
const markSpam = ([authorId, author]) => {
  if (!spammersDetected.has(authorId)) { spammersDetected.set(authorId, { authorId, author, spam: true }); }
};

/** @type {(msg: Message) => Boolean} */
const isPleb = msg => !(msg.types & GIGACHAD);

const hidden = toSet(sessionHidden);

export const capturedMessages = readable([], set => {
  let items = [];

  const { cleanUp, store: source } = combineStores(
    sources.thirdParty,
    sources.translations,
    sources.mod
  );

  const sourceUnsub = source.subscribe(msg => {
    if (msg) {
      set(items = [...items, { ...msg, index: items.length }]);
    }
  });

  const hideOrReplaceMsg = bonkOrDeletion => {
    switch (ytcDeleteBehaviour.get()) {
      case YtcDeleteBehaviour.HIDE:
        return { hidden: true };
      case YtcDeleteBehaviour.PLACEHOLDER:
        return { messageArray: bonkOrDeletion.replacedMessage, deleted: true };
    }
    return null;
  };

  const hideOrReplace = (i, bonkOrDeletion) => {
    const msgModifications = hideOrReplaceMsg(bonkOrDeletion);
    if (!msgModifications) return;
    const before = items.slice(0, i);
    const after = items.slice(i + 1);
    set(items = [...before, { ...items[i], ...msgModifications }, ...after]);
  };

  const delOrBonkSub = (source, diffAttr) => source.subscribe(events => {
    if (!events || events.length < 1) return;
    items.map((item, i) => [item, i]).reverse().forEach(([item, i]) => {
      events.some(event => {
        if (item[diffAttr] !== event[diffAttr]) return false;
        hideOrReplace(i, event);
        return true;
      });
    });
  });
  const bonkUnsub = delOrBonkSub(sources.ytcBonks, 'authorId');
  const deletionUnsub = delOrBonkSub(sources.ytcDeletions, 'messageId');
  return () => {
    cleanUp();
    sourceUnsub();
    bonkUnsub();
    deletionUnsub();
  };
});

const spamStores = [spamMsgAmount, spamMsgInterval]
  .map(store => derived(store, Math.round));

const dispDepends = [
  ...[capturedMessages, allBanned, hidden, spotlightedTranslator],
  ...[...spamStores, whitelistedSpam, enableSpamProtection, disableSpecialSpamProtection]
];

const dispTransform =
  ([$items, $banned, $hidden, $spot, $spamAmt, $spamInt, $whitelisted, $enSpam, $disSpecialSpam]) => {
    const attrNotIn = (set, attr) => item => !set.has(item[attr]);
    const notWhitelisted = ([id]) => !$whitelisted(id);
    const possibleSpam = $disSpecialSpam ? $items.filter(isPleb) : $items;
    const spammers = $enSpam
      ? getSpamAuthors(possibleSpam, $spamAmt, $spamInt).filter(notWhitelisted)
      : [];
    const spammerIds = new Set(spammers.map(([id]) => id));
    spammers.forEach(markSpam);

    $items = $items
      ?.filter(attrNotIn($banned, 'authorId'))
      ?.filter(attrNotIn($hidden, 'messageId'))
      ?.filter(attrNotIn(spammerIds, 'authorId'))
      ?.filter(msg => !$spot || msg.authorId === $spot) ?? [];
    return removeDuplicateMessages($items);
  };

export const displayedMessages = derived(dispDepends, dispTransform);

export const captionText = readable(defaultCaption, set => {
  let text = defaultCaption;
  return displayedMessages.subscribe($msgs => {
    const $translation = $msgs[$msgs.length - 1]?.text;
    if ($translation != null && $translation !== text) {
      set(text = $translation);
    }
  });
});

// hmr
if (window.unsubDictation) window.unsubDictation();
window.unsubDictation = captionText.subscribe($txt => $txt !== defaultCaption && checkAndSpeak($txt));
