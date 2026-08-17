import { detectForceReload } from './ts/ytcf-logic';
import Settings from './components/YtcFilterSettings.svelte';
import './ts/resize-tracker';

const options = new Settings({
  target: document.body
});

detectForceReload();

export default options;
