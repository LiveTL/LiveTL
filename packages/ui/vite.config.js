import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

import componentNames from './components.js';

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess() })],
  build: {
    lib: {
      entry: Object.fromEntries(componentNames.map((name) => [name, `src/${name}.svelte`])),
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [/^svelte(?:\/.*)?$/],
    },
  },
});
