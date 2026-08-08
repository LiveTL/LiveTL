import App from '../../components/Popout.svelte';
import { mount } from 'svelte';
import { displayMode } from '../store.js';
import { DisplayMode } from '../constants.js';
import '../../stylesheets/tailwind.css';

displayMode.set(DisplayMode.POPOUT);

const app = mount(App, {
  target: document.body,
  props: {
  }
});

window.app = app;

export default app;
