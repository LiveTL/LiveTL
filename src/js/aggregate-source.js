import { readable, derived } from 'svelte/store';
import { sources } from './sources.js';
import { ytcDeleteBehaviour, sessionBanned, sessionHidden, spotlightedTranslator } from './store.js';
import { YtcDeleteBehaviour } from './constants.js';

export const capturedMessages = readable([], set => {
  let items = [];

  const { cleanUp, store: sourceWithDups } = combineStores(
    sources.translations,
    sources.mod,
  );
  const source = removeDuplicateMessages(sourceWithDups);
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
  }

  const hideOrReplace = (i, bonkOrDeletion) => {
    const msgModifications = hideOrReplace(bonkOrDeletion);
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
    deletetionUnsub();
  };
});

const dispDepends = [capturedMessages, sessionBanned, sessionHidden, spotlightedTranslator];
export const displayedMessages = derived(dispDepends, ([$items, $banned, $hidden, $spot]) => {
  const attrNotIn = (set, attr) => item => !set.has(item[attr]);
  return $items
    .filter(attrNotIn(new Set(...$banned), 'authorId'))
    .filter(attrNotIn(new Set(...$hidden), 'messageId')) // TODO add messageId attr to mchad messages
    .filter($spot ? msg => msg.authorId === $spot : () => true);
});
