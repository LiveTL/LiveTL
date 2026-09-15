import 'smelte/src/tailwind.css';

import Hyperchat from './components/Hyperchat.svelte';
import { stripYoutubePlayerShell, stripYoutubePlayerStyles } from './ts/chat-utils';
import { detectForceReload } from './ts/ytcf-logic';

stripYoutubePlayerShell();
stripYoutubePlayerStyles();

(window as any).useYtTheme = true;

const hyperchat = new Hyperchat({
  target: document.body,
});

detectForceReload();

export default hyperchat;
