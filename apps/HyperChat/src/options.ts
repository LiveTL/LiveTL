import './stylesheets/tailwind.css';

import { mount } from 'svelte';

import Settings from './components/Settings.svelte';

const options = mount(Settings, {
  target: document.body,
});

export default options;
