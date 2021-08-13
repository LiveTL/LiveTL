import App from '../../components/Popout.svelte';
import { displayMode } from '../store.js';
import { DisplayMode } from '../constants.js';

displayMode.set(DisplayMode.POPOUT);

const app = new App({
  target: document.body,
  props: {
  }
});

window.app = app;

export default app;