import path from 'path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import zipPack from 'vite-plugin-zip-pack';

const pkg = readJsonFile('package.json');
const manifest = readJsonFile('src/manifest.json');

const browser = process.env.BROWSER ?? 'chrome';
const version = process.env.VERSION ?? pkg.version;
const buildDir = `build/${browser}`;

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
    __MV__: JSON.stringify(3),
    __LIVETL__: JSON.stringify(false),
  },
  plugins: [
    webExtension({
      manifest: () => {
        const nextManifest = {
          ...manifest,
          version: (process.env.VERSION ?? '').split('-')[0] || manifest.version,
        };
        if ('browser_specific_settings' in nextManifest && process.env.ADDON_ID) {
          nextManifest.browser_specific_settings.gecko.id = process.env.ADDON_ID;
        }
        return nextManifest;
      },
      // TODO: re-enable this once we've upgraded vite-plugin-web-extension
      skipManifestValidation: true,
      assets: 'assets',
      watchFilePaths: [path.resolve(__dirname, 'src/manifest.json')],
      additionalInputs: ['hyperchat.html', 'setup.html', 'scripts/chat-interceptor.ts', 'scripts/chat-metagetter.ts'],
      disableAutoLaunch: process.env.AUTOLAUNCH !== 'true',
      browser,
      webExtConfig: {
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
      outFileName: `YtcFilter-${browser === 'chrome' ? 'Chrome.zip' : 'Firefox.xpi'}`,
    }),
  ],
});
