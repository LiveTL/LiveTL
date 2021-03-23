import App from '../../components/BrowserAction.svelte';

const app = new App({
  target: document.body,
  props: {
  }
});

window.app = app;

export default app;
