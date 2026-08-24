import path from 'path';

import alias from '@rollup/plugin-alias';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import browserExtension from 'vite-plugin-web-extension';
import zipPack from 'vite-plugin-zip-pack';

import { resolveMv } from '../HyperChat/scripts/resolve-manifest';

import manifest from './src/manifest.json';

const htmlInputs = [
  'watch.html',
  'popout.html',
  'options.html',
  'welcome.html',
  'lite.html',
  'background.html',
  'hyperchat/index.html',
  'hyperchat/options.html',
];

const jsEntry = [
  'ts/yt-workaround.ts',
  'hyperchat/scripts/chat-interceptor.ts',
  'hyperchat/scripts/chat-metagetter.ts',
  'hyperchat/scripts/chat-mounter.ts',
  'hyperchat/scripts/chat-translation-host.ts',
];

// chrome does not like _ in filename
// see: https://github.com/rollup/rollup/issues/4772#issuecomment-1366727437
// eslint-disable-next-line no-control-regex
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F_]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;
function sanitizeFileName(name) {
  const match = DRIVE_LETTER_REGEX.exec(name);
  const driveLetter = match ? match[0] : '';
  return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '+');
}

const browser = process.env.BROWSER ?? 'chrome';
const mv = process.env.MV === '2' ? 2 : 3;
const version = process.env.VERSION ?? manifest.version ?? '69.420';
const target = mv === 2 ? 'mv2' : browser;
const buildDir = `build/${target}`;

if (mv === 2 && browser !== 'firefox') {
  throw new Error('MV2 is Firefox-only; set BROWSER=firefox.');
}

export default defineConfig({
  root: 'src',
  define: {
    __BROWSER__: JSON.stringify(browser),
    __VERSION__: JSON.stringify(version),
    __MV__: JSON.stringify(mv),
    __LIVETL__: JSON.stringify(true),
  },
  build: {
    outDir: path.resolve(__dirname, buildDir),
    emptyOutDir: true,
    minify: process.env.MINIFY !== 'false',
    rollupOptions: {
      output: {
        sanitizeFileName,
      },
    },
  },
  resolve: {
    alias: {
      '@hyperchat': path.resolve(__dirname, '../HyperChat/src'),
      'jquery.ui': 'jquery-ui-bundle',
    },
  },
  plugins: [
    alias(),

    // TODO: add the isAndroid replacements
    svelte({
      configFile: path.resolve(__dirname, 'svelte.config.js'),
      emitCss: false,
    }),

    // allow-iframe.json contains static DeclarativeNetHTTP rules
    // for allowing iframing of ytc, need to manually copy over
    copy({
      hook: 'writeBundle',
      targets: [
        {
          src: path.resolve(__dirname, 'src/allow-iframe.json'),
          dest: `${buildDir}/`,
        },
      ],
    }),

    // add-yt-embed-referer.json contains static DeclarativeNetHTTP rules
    // for allowing embed yt vids, need to manually copy over
    copy({
      hook: 'writeBundle',
      targets: [
        {
          src: path.resolve(__dirname, 'src/add-yt-embed-referer.json'),
          dest: `${buildDir}/`,
        },
      ],
    }),

    // include hyperchat's assets
    copy({
      hook: 'writeBundle',
      targets: [
        {
          src: path.resolve(__dirname, '../HyperChat/src/assets/*'),
          dest: `${buildDir}/hyperchat`,
        },
      ],
    }),

    // copy over hyperchat stylesheets
    // these should ideally be copied over automatically from this plugin
    // however, they do not get copied
    copy({
      hook: 'writeBundle',
      targets: [
        {
          src: path.resolve(__dirname, '../HyperChat/src/stylesheets/*'),
          dest: `${buildDir}/hyperchat/stylesheets`,
        },
      ],
    }),

    browserExtension({
      manifest: () => {
        const nextManifest = resolveMv(JSON.parse(JSON.stringify(manifest)), mv);
        nextManifest.version = version;

        if (mv === 3 && browser === 'chrome') {
          // The watch-mode video workaround runs on `youtube.com/error?...` and must execute in the
          // page world so it can access the YT iframe API. DOM-injecting a `chrome-extension://`
          // script is blocked by YouTube's CSP in Chromium, so run the content script as `MAIN`.
          for (const entry of nextManifest.content_scripts ?? []) {
            if (entry.matches?.includes('https://www.youtube.com/error*?*')) {
              entry.world = 'MAIN';
            }
          }
        }

        return nextManifest;
      },
      // TODO: re-enable this once we've upgraded vite-plugin-web-extension
      skipManifestValidation: true,
      assets: 'img',
      additionalInputs: [...htmlInputs, ...jsEntry],
      watchFilePaths: [path.resolve(__dirname, 'src/manifest.json'), path.resolve(__dirname, 'src/allow-iframe.json')],
      webExtConfig: {
        // lofi hip hop (the one that spawned after the og one ended)
        startUrl: 'https://www.youtube.com/watch?v=X4VbdwhkE10',
      },
      disableAutoLaunch: true,
      browser,
    }),
    ...(target === 'chrome' || target === 'mv2'
      ? [
          zipPack({
            inDir: buildDir,
            outDir: 'build',
            outFileName: target === 'chrome' ? 'LiveTL-Chrome.zip' : 'LiveTL-Firefox-mv2.zip',
          }),
        ]
      : []),
  ],
});
