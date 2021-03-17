import App from '../svelte/Options.svelte';

const app = new App({
  target: document.body,
  props: {
    name: 'world'
  }
});

window.app = app;

export default app;