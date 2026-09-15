import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: 'src/Icon.svelte',
      formats: ['es'],
      fileName: () => 'Icon.js',
    },
    rollupOptions: {
      external: [/^svelte(?:\/.*)?$/],
    },
  },
});
