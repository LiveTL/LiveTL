import { readable, derived, Readable } from 'svelte/store';
import { combineStores, sources } from './sources.js';
import { removeDuplicateMessages } from './sources-util.js';
import { ytcDeleteBehaviour, sessionHidden, spotlightedTranslator, channelFilters, mchadUsers } from './store.js';
import { YtcDeleteBehaviour } from './constants.js';

/** @type {Readable<String[]>} */
const channelBlacklisted = derived(channelFilters, $chan => $chan
  .filter(([_id, filter]) => filter.blacklist)
  .map(([id, _filter]) => id)
);

/** @type {Readable<String[]>} */
const mchadBlacklisted = derived(mchadUsers, $mchad => $mchad
  .filter(([_name, banned]) => banned)
  .map(([name, _banned]) => name)
);

/** @type {Readable<Set<String>>} */
export const allBanned = derived([channelBlacklisted, mchadBlacklisted], ([$chan, $mchad]) => {
  return new Set([...$chan, ...$mchad]);
}, []);

/** @type {Readable<Set<String>>} */
const hidden = derived(sessionHidden, $hidden => new Set($hidden));

export const capturedMessages = readable([], set => {
  let items = [];

  const { cleanUp, store: source } = combineStores(
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

const dispDepends = [capturedMessages, allBanned, hidden, spotlightedTranslator];
export const displayedMessages = derived(dispDepends, ([$items, $banned, $hidden, $spot]) => {
  const attrNotIn = (set, attr) => item => !set.has(item[attr]);
  $items = $items
    ?.filter(attrNotIn($banned, 'authorId'))
    ?.filter(attrNotIn($hidden, 'messageId'))
    ?.filter($spot ? msg => msg.authorId === $spot : () => true) ?? [];
  return removeDuplicateMessages($items);
});
