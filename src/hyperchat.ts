import Hyperchat from './components/Hyperchat.svelte';
import 'smelte/src/tailwind.css';
import { stripYoutubePlayerShell, stripYoutubePlayerStyles } from './ts/chat-utils';

stripYoutubePlayerShell();
stripYoutubePlayerStyles();

const hyperchat = new Hyperchat({
  target: document.body
});

export default hyperchat;
