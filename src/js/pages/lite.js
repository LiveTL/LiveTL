import App from '../../components/Lite.svelte';
import { displayMode } from '../store.js';
import { DisplayMode } from '../constants.js';
import 'smelte/src/tailwind.css';

displayMode.set(DisplayMode.HOLODEX);

const app = new App({
  target: document.body,
  props: {
  }
});

window.app = app;

export default app;
