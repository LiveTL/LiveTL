import 'smelte/src/tailwind.css';

import App from '../../components/Watch.svelte';

const app = new App({
  target: document.body,
  props: {},
});

window.app = app;

export default app;
