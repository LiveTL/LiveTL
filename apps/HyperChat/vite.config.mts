import path from 'path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import zipPack from 'vite-plugin-zip-pack';

import pkg from './package.json' with { type: 'json' };
import { resolveMv } from './scripts/resolve-manifest';
import manifest from './src/manifest.json' with { type: 'json' };

const browser = process.env.BROWSER ?? 'chrome';
const mv = process.env.MV === '2' ? 2 : 3;
const version = process.env.VERSION ?? pkg.version;

// MV2 is Firefox-only, so it needs no per-browser output dir of its own.
const target = mv === 2 ? 'mv2' : browser;
const buildDir = `build/${target}`;

export default defineConfig({
  root: 'src',
  build: {
    outDir: path.resolve(__dirname, buildDir),
    emptyOutDir: true,
    minify: process.env.MINIFY !== 'false' ? 'terser' : false,
  },
  define: {
    __BROWSER__: JSON.stringify(browser),
    __VERSION__: JSON.stringify(version),
    __MV__: JSON.stringify(mv),
  },
  plugins: [
    webExtension({
      manifest: () => ({
        ...resolveMv(manifest, mv),
        version,
      }),
      skipManifestValidation: true,
      watchFilePaths: [path.resolve(__dirname, 'src/manifest.json')],
      additionalInputs: ['hyperchat.html', 'scripts/chat-interceptor.ts', 'scripts/chat-metagetter.ts'],
      disableAutoLaunch: process.env.AUTOLAUNCH !== 'true',
      browser,
      webExtConfig: {
        target: browser === 'firefox' ? 'firefox-desktop' : 'chromium',
        startUrl: 'https://www.youtube.com/watch?v=X4VbdwhkE10',
      },
    }),
    svelte({
      configFile: path.resolve(__dirname, 'svelte.config.js'),
      emitCss: false,
    }),
    copy({
      hook: 'writeBundle',
      targets: [
        {
          src: 'src/stylesheets/*',
          dest: `${buildDir}/stylesheets`,
        },
      ],
    }),
    zipPack({
      inDir: buildDir,
      outDir: 'build',
      outFileName: `HyperChat-${target}.zip`,
    }),
  ],
});
