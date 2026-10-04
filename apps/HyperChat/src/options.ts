import 'smelte/src/tailwind.css';
import '@livetl/ui/styles.css';

import Settings from './components/Settings.svelte';

const options = new Settings({
  target: document.body,
});

export default options;
