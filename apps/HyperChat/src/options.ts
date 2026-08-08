import Settings from './components/Settings.svelte';
import 'smelte/src/tailwind.css';

const options = new Settings({
  target: document.body
});

export default options;
