import 'smelte/src/tailwind.css';

import App from '../../components/Popout.svelte';
import { DisplayMode } from '../constants.js';
import { displayMode } from '../store.js';

displayMode.set(DisplayMode.POPOUT);

const app = new App({
  target: document.body,
  props: {},
});

window.app = app;

export default app;
