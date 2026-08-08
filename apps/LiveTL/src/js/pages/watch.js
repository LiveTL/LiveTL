import App from '../../components/Watch.svelte';
import { mount } from 'svelte';
import '../../stylesheets/tailwind.css';

const app = mount(App, {
  target: document.body,
  props: {
  }
});

window.app = app;

export default app;
