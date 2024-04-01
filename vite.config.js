import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import browserExtension from 'vite-plugin-web-extension';
import path from 'path';
import fs from 'fs';
import alias from '@rollup/plugin-alias';
import copy from 'rollup-plugin-copy';
import replace from 'rollup-plugin-replace';
import manifest from './src/manifest.json';

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
    scripts: ['/js/pages/background.js', '/submodules/chat/src/scripts/chat-background.ts']
  },
  { name: 'html/hyperchat/index.html', scripts: ['/submodules/chat/src/hyperchat.ts'] },
  { name: 'html/hyperchat/options.html', scripts: ['/submodules/chat/src/options.ts'] }
];

const jsEntry = [
  'ts/yt-workaround.ts',
  'submodules/chat/src/scripts/chat-metagetter.ts',
  'submodules/chat/src/scripts/chat-mounter.ts'
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
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F_]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;
function sanitizeFileName(name) {
  const match = DRIVE_LETTER_REGEX.exec(name);
  const driveLetter = match ? match[0] : '';
  return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '+');
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: path.resolve(__dirname, 'build'),
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

    // allow-iframe.json contains static DeclarativeNetHTTP rules
    // for allowing iframing of ytc, need to manually copy over
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/allow-iframe.json'),
        dest: 'build/',
      }]
    }),

    // include hyperchat's assets
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/submodules/chat/src/assets/*'),
        dest: 'build/hyperchat'
      }]
    }),

    // copy over html/ folder into project root
    // TODO: find a better way of doing this,
    // I really don't want a lot of auto-gen html in src/
    // but copying all the files over may be slow
    copy({
      hook: 'writeBundle',
      targets: [{
        src: 'build/html/*', dest: 'build'
      }]
    }),

    // copy over hyperchat stylesheets
    // these should ideally be copied over automatically from this plugin
    // however, they do not get copied
    copy({
      hook: 'writeBundle',
      targets: [{
        src: path.resolve(__dirname, 'src/submodules/chat/src/stylesheets/*'),
        dest: 'build/submodules/chat/src/stylesheets'
      }]
    }),

    browserExtension({
      manifest: () => ({
        ...manifest,
        version: process.env.VERSION ?? manifest.version ?? '69.420',
        // following should only be in dev builds
        // it is being commented out as unsafe-eval is not allowed in mv3
        // content_security_policy: {
        //   extension_pages: 'script-src \'self\' \'unsafe-eval\'; object-src \'self\'',
        // }
      }),
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
        startUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
      },
      disableAutoLaunch: true,
      browser: process.env.BROWSER === undefined ? 'chrome' : process.env.BROWSER,
    }),

    copy({
      hook: 'writeBundle',
      targets: [{
        src: 'build/manifest.json',
        dest: 'build/',
        transform: (content) => {
          const newManifest = JSON.parse(content.toString());
          if ('incognito' in newManifest) {
            delete newManifest.incognito;
          }
          if ('service_worker' in newManifest.background) {
            newManifest.background = {
              scripts: [newManifest.background.service_worker]
            };
          }
          return JSON.stringify(newManifest, null, 2);
        },
        rename: 'manifest.firefox.json'
      }]
    })
  ]
});
