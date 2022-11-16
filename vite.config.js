import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import browserExtension from 'vite-plugin-web-extension';
import path from 'path';
import fs from 'fs';
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
  { name: 'html/hyperchat/options.html', scripts: ['/submodules/chat/src/options.ts'] },
];

const entryPointTemplate = fs.readFileSync(path.join(__dirname, 'src/empty.html'))
  .toString();

for (const entry of entryPoints) {
  const htmlEntry = entry.scripts.reduce((template, script) => template.replace(
    '</head>', `  <script defer type="module" src="${script}"></script>\n</head>`
  ), entryPointTemplate);
  fs.writeFileSync(`src/${entry.name}`, htmlEntry);
};

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

    browserExtension({
      manifest: () => ({
        ...manifest,
        version: process.env.VERSION ?? manifest.version ?? '69.420',
        // following should only be in dev builds
        content_security_policy: 'script-src \'self\' \'unsafe-eval\'; object-src \'self\''
      }),
      assets: 'img',
      additionalInputs: [
        ...entryPoints.map(entry => entry.name)
      ],
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
