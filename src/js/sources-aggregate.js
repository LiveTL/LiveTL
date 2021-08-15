import { readable, derived, Readable } from 'svelte/store';
import { not } from './utils.js';
import { combineStores, sources } from './sources.js';
import { getSpamAuthors, removeDuplicateMessages } from './sources-util.js';
import { ytcDeleteBehaviour, sessionHidden, spotlightedTranslator } from './store.js';
import { channelFilters, mchadUsers, spamMsgAmount, spamMsgInterval } from './store.js';
import { spammersDetected } from './store.js';
import { YtcDeleteBehaviour } from './constants.js';

/**
 * @template {T}
 * @type {(store: Readable<T>, getBool: (val: T) => Boolean) => Readable<String[]>}
 */
const lookupStoreToList = (store, getBool=Boolean) => derived(store, $val => $val
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
const notSpammer = lookupStoreToList(spammersDetected, f => !f);

export const allBanned = toSet(channelBlacklisted, mchadBlacklisted);
export const notSpamStore = toSet(notSpammer);

/** @type {Readable<(msg: Message) => Boolean>} */
const whitelistedSpam = derived(notSpamStore, $set => msg => $set.has(msg.authorId));

/** @type {(msg: Message) => Void} */
const markSpam = msg => spammersDetected.set(msg.author, true);

const hidden = toSet(sessionHidden);

export const capturedMessages = readable([], set => {
  let items = [];

  const { cleanUp, store: source } = combineStores(
    sources.translations,
    sources.mod,
  );

  const sourceUnsub = source.subscribe(msg => {
    if (msg) {
      set(items = [...items, {...msg, index: items.length}]);
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
    set(items = [...before, {...items[i], ...msgModifications}, ...after]);
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
  .map(store => derived(store, Math.ceil));

const dispDepends =
  [capturedMessages, allBanned, hidden, spotlightedTranslator, ...spamStores, whitelistedSpam];

const dispTransform = ([$items, $banned, $hidden, $spot, $spamAmt, $spamInt, $whitelisted]) => {
  const attrNotIn = (set, attr) => item => !set.has(item[attr]);
  const spammers = new Set(getSpamAuthors($items, $spamAmt, $spamInt).filter(not($whitelisted)));

  spammers.forEach(markSpam);

  $items = $items
    ?.filter(attrNotIn($banned, 'authorId'))
    ?.filter(attrNotIn($hidden, 'messageId'))
    ?.filter(attrNotIn(spammers, 'authorId'))
    ?.filter($spot ? msg => msg.authorId === $spot : () => true) ?? [];
  return removeDuplicateMessages($items);
};

export const displayedMessages = derived(dispDepends, dispTransform);
