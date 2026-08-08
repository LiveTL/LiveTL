import Hyperchat from '../components/Hyperchat.svelte';
import tailwind from 'smelte/src/tailwind.css?inline';
import { isLiveTL } from '../ts/chat-constants';
import { stripYoutubePlayerShell, stripYoutubePlayerStyles } from '../ts/chat-utils';

const FONT_LINK_ID = 'hyperchat-font-link';
const TAILWIND_STYLE_ID = 'hyperchat-tailwind-style';

const stripEmbedArtifacts = (): void => {
  stripYoutubePlayerShell();
};

const ensureHeadAssets = (): void => {
  if (document.getElementById(FONT_LINK_ID) === null) {
    const font = document.createElement('link');
    font.id = FONT_LINK_ID;
    font.href = (
      'https://fonts.googleapis.com/css' +
      '?family=Roboto:100,300,400,500,700,900' +
      '|Material+Icons&display=swap'
    );
    font.rel = 'stylesheet';
    document.head.appendChild(font);
  }

  if (document.getElementById(TAILWIND_STYLE_ID) === null) {
    const style = document.createElement('style');
    style.id = TAILWIND_STYLE_ID;
    style.innerHTML = tailwind;
    document.head.appendChild(style);
  }
};

const mount = (): void => {
  console.log('[HyperChat] mounting hyperchat in embed frame');
  stripEmbedArtifacts();
  stripYoutubePlayerStyles();
  document.documentElement.style.cssText = 'background-color: transparent !important;';
  document.body.style.cssText = 'margin: 0 !important; background-color: transparent !important; overflow: hidden !important;';

  ensureHeadAssets();
  console.log(new Hyperchat({
    target: document.body
  }));

  new MutationObserver(() => {
    stripEmbedArtifacts();
  }).observe(document.body, {
    childList: true
  });

  if (document.head != null) {
    new MutationObserver(stripYoutubePlayerStyles).observe(document.head, {
      childList: true,
      subtree: true
    });
  }
};

if (isLiveTL) {
  mount();
}
else {
  setTimeout(() => {
    if (document.querySelector('.hyperchat-root') === null) {
      mount();
    }
  }, 500);
}
