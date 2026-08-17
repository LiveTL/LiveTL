import 'smelte/src/tailwind.css';
import './ts/resize-tracker';

import Settings from './components/YtcFilterSettings.svelte';
import { detectForceReload } from './ts/ytcf-logic';

const options = new Settings({
  target: document.body,
});

detectForceReload();

export default options;
