// import { displayMode } from '../store.js';
// import { DisplayMode } from '../constants.js';
import 'smelte/src/tailwind.css';

import App from '../../components/Lite.svelte';

// displayMode.set(DisplayMode.HOLODEX);

const app = new App({
  target: document.body,
  props: {},
});

window.app = app;

export default app;
