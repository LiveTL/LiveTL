import { detectForceReload } from './ts/ytcf-logic';
import YtcFilterSetup from './components/YtcFilterSetup.svelte';
import './ts/resize-tracker';

const options = new YtcFilterSetup({
  target: document.body
});

detectForceReload();

export default options;
