import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import browserExtension from 'vite-plugin-web-extension';
import path from 'path';
import fs from 'fs';
import alias from '@rollup/plugin-alias';
import copy from 'rollup-plugin-copy';
import replace from 'rollup-plugin-replace';
import manifest from './src/manifest.json';
import { resolveMv } from '../HyperChat/scripts/resolve-manifest';

// include all entry points from src/js/pages/*.js
const pagesEntryPoints = [
  'watch', 'popout', 'options', 'welcome', 'lite'
].map(page => ({
  name: `html/${page}.html`, scripts: [`/js/pages/${page}.js`]
}));

const entryPoints = [
  ...pagesEntryPoints,
  {
    name: 'html/background.html',
    scripts: ['/js/pages/background.js']
  },
  { name: 'html/hyperchat/index.html', scripts: ['/submodules/chat/src/hyperchat.ts'] },
  { name: 'html/hyperchat/options.html', scripts: ['/submodules/chat/src/options.ts'] }
];

const jsEntry = [
  'ts/yt-workaround.ts',
  'submodules/chat/src/scripts/chat-interceptor.ts',
  'submodules/chat/src/scripts/chat-metagetter.ts',
  'submodules/chat/src/scripts/chat-mounter.ts',
  'submodules/chat/src/scripts/chat-translation-host.ts'
];

const entryPointTemplate = fs.readFileSync(path.join(__dirname, 'src/empty.html'))
  .toString();

for (const entry of entryPoints) {
  const htmlEntry = entry.scripts.reduce((template, script) => template.replace(
    '</head>', `  <script defer type="module" src="${script}"></script>\n</head>`
  ), entryPointTemplate);
  fs.writeFileSync(`src/${entry.name}`, htmlEntry);
}

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

const browser = process.env.BROWSER === undefined ? 'chrome' : process.env.BROWSER;
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
    __MV__: JSON.stringify(mv)
  },
  build: {
    outDir: path.resolve(__dirname, buildDir),
    emptyOutDir: true,
    minify: process.env.MINIFY !== 'false',
    rollupOptions: {
      output: {
        sanitizeFileName
      }
    }
  },
  resolve: {
    alias: {
      '@hyperchat': path.resolve(__dirname, '../HyperChat/src'),
      'jquery.ui': 'jquery-ui-bundle'
    }
  },
  plugins: [
    alias(),

    replace({
      values: {
        'isLiveTL = false': 'isLiveTL = true'
      }
    }),

    // TODO: add the isAndroid replacements
    svelte({
      configFile: path.resolve(__dirname, 'svelte.config.js'),
      emitCss: false
    }),

    // allow-iframe.json contains static DeclarativeNetHTTP rules
    // for allowing iframing of ytc, need to manually copy over
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/allow-iframe.json'),
        dest: `${buildDir}/`
      }]
    }),

    // add-yt-embed-referer.json contains static DeclarativeNetHTTP rules
    // for allowing embed yt vids, need to manually copy over
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/add-yt-embed-referer.json'),
        dest: `${buildDir}/`
      }]
    }),

    // include hyperchat's assets
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, '../HyperChat/src/assets/*'),
        dest: `${buildDir}/hyperchat`
      }]
    }),

    // copy over html/ folder into project root
    // TODO: find a better way of doing this,
    // I really don't want a lot of auto-gen html in src/
    // but copying all the files over may be slow
    copy({
      hook: 'writeBundle',
      targets: [{
        src: `${buildDir}/html/*`, dest: buildDir
      }]
    }),

    // copy over hyperchat stylesheets
    // these should ideally be copied over automatically from this plugin
    // however, they do not get copied
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/submodules/chat/src/stylesheets/*'),
        dest: `${buildDir}/submodules/chat/src/stylesheets`
      }]
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
      assets: 'img',
      additionalInputs: [
        ...entryPoints.map(entry => entry.name),
        ...jsEntry
      ],
      watchFilePaths: [
        path.resolve(__dirname, 'src/manifest.json'),
        path.resolve(__dirname, 'src/allow-iframe.json')
      ],
      webExtConfig: {
        // lofi hip hop (the one that spawned after the og one ended)
        startUrl: 'https://www.youtube.com/watch?v=X4VbdwhkE10'
      },
      disableAutoLaunch: true,
      browser
    })
  ]
});
