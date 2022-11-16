import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import browserExtension from 'vite-plugin-web-extension';
import path from 'path';
import copy from 'rollup-plugin-copy';
import replace from 'rollup-plugin-replace';
import manifest from './src/manifest.json';

export default defineConfig({
  root: 'src',
  build: {
    outDir: path.resolve(__dirname, 'build'),
    emptyOutDir: true,
    minify: process.env.MINIFY !== 'false'
  },
  plugins: [
    // jquery-ui-touch-punch needs to be more specific ig?
    // @KentoNishi is this why?
    replace({
      include: path.resolve(__dirname, 'node_modules/jquery-ui-touch-punch'),
      '(jQuery)': '(window.jQuery)',
    }),

    // TODO: add the isAndroid replacements 
    svelte({
      configFile: path.resolve(__dirname, 'svelte.config.js'),
      emitCss: false
    }),

    // firefox doesn't have incognito: 'split' in its manifest
    // manifest.json is swapped for manifest.chrome.json in the
    // production zip by utils/package.js
    copy({
      hook: 'writeBundle',
      targets: [{
        src: 'build/manifest.json',
        dest: 'build/',
        transform: (content) => {
          const newManifest = JSON.parse(content.toString());
          newManifest.incognito = 'split';
          return JSON.stringify(newManifest, null, 2);
        },
        rename: 'manifest.chrome.json'
      }]
    }),

    // include hyperchat's assets
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/submodules/chat/src/assets'),
        dest: 'build/hyperchat'
      }]
    }),

    browserExtension({
      manifest: () => ({
        ...manifest,
        version: process.env.VERSION ?? manifest.version ?? '69.420',
        // following should only be in dev builds
        content_security_policy: 'script-src \'self\' \'unsafe-eval\'; object-src \'self\''
      }),
      assets: 'img',
      watchFilePaths: [
        path.resolve(__dirname, 'src/manifest.json')
      ],
      webExtConfig: {
        // lofi hip hop (the one that spawned after the og one ended)
        startUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
      },
      disableAutoLaunch: true,
    })
  ]
});
