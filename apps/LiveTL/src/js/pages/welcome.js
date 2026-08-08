import App from '../../components/Welcome.svelte';
import 'smelte/src/tailwind.css';

const app = new App({
  target: document.body,
  props: {
  }
});

window.app = app;

export default app;
