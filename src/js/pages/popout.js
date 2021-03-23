import App from '../../components/Popout.svelte';

const app = new App({
  target: document.body,
  props: {
    isStandalone: true
  }
});

window.app = app;

export default app;