import { get } from 'svelte/store';
import { FeaturePrompt } from './constants.js';
import { displayedMessages } from './sources-aggregate.js';
import { index } from './sources-util.js';
import { promptToShow } from './store.js';

export const enable = () => {
  const pushedPrompts = new Set();

  const pushPrompt = prompt => {
    if (pushedPrompts.has(prompt)) return;
    pushedPrompts.add(prompt);
    promptToShow.set([...get(promptToShow), prompt]);
  };

  const unsubSpotlight = displayedMessages.subscribe(msgs => {
    const numAuthors = index(msgs).by('authorId').size;
    if (numAuthors >= 3) {
      pushPrompt(FeaturePrompt.SPOTLIGHT);
    }
  });

  return () => {
    unsubSpotlight();
  };
};
