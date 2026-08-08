import './stylesheets/tailwind.css';

import { mount } from 'svelte';

import Hyperchat from './components/Hyperchat.svelte';
import { stripYoutubePlayerShell, stripYoutubePlayerStyles } from './ts/chat-utils';

stripYoutubePlayerShell();
stripYoutubePlayerStyles();

const hyperchat = mount(Hyperchat, {
  target: document.body,
});

export default hyperchat;
