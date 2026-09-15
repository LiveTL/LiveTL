import './ts/resize-tracker';

import YtcFilterSetup from './components/YtcFilterSetup.svelte';
import { detectForceReload } from './ts/ytcf-logic';

const options = new YtcFilterSetup({
  target: document.body,
});

detectForceReload();

export default options;
