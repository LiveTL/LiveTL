import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const targets = {
  chrome: 3,
  firefox: 3,
  mv2: 2,
};
const versions = new Set();

const iconFiles = (value) => (typeof value === 'string' ? [value] : Object.values(value ?? {}).flatMap(iconFiles));

const assertFile = async (buildDir, target, file) => {
  await assert.doesNotReject(access(path.join(buildDir, file)), `${target}: missing ${file}`);
};

for (const [target, mv] of Object.entries(targets)) {
  const buildDir = path.resolve('build', target);
  const manifest = JSON.parse(await readFile(path.join(buildDir, 'manifest.json'), 'utf8'));
  const serializedManifest = JSON.stringify(manifest);
  versions.add(manifest.version);

  assert.equal(manifest.manifest_version, mv, `${target}: wrong manifest version`);
  assert.ok(!serializedManifest.includes('{{'), `${target}: unresolved manifest tag`);
  assert.ok(!serializedManifest.includes('submodules/chat'), `${target}: legacy HyperChat path`);
  assert.ok(serializedManifest.includes('hyperchat/scripts/chat-interceptor.js'), `${target}: missing HyperChat interceptor`);
  assert.ok(serializedManifest.includes('hyperchat/scripts/chat-injector.js'), `${target}: missing HyperChat injector`);

  if (mv === 2) {
    assert.deepEqual(manifest.background, { page: 'background.html', persistent: true }, 'mv2: wrong background');
    assert.ok(manifest.browser_action, 'mv2: missing browser_action');
    assert.equal(manifest.action, undefined, 'mv2: unexpected action');
    assert.equal(manifest.host_permissions, undefined, 'mv2: unexpected host permissions');
    assert.equal(manifest.declarative_net_request, undefined, 'mv2: unexpected DNR rules');
    assert.equal(manifest.browser_specific_settings, undefined, 'mv2: unexpected Firefox metadata');
    for (const permission of ['webRequest', 'webRequestBlocking']) {
      assert.ok(manifest.permissions.includes(permission), `mv2: missing ${permission}`);
    }
  } else {
    assert.ok(manifest.action, `${target}: missing action`);
    assert.equal(manifest.browser_action, undefined, `${target}: unexpected browser_action`);
    assert.ok(Array.isArray(manifest.host_permissions), `${target}: missing host permissions`);
    if (target === 'chrome') {
      assert.equal(typeof manifest.background?.service_worker, 'string', 'chrome: missing service worker');
      assert.equal(manifest.background?.scripts, undefined, 'chrome: unexpected background scripts');
      assert.equal(manifest.incognito, 'split', 'chrome: wrong incognito mode');
      assert.ok(manifest.declarative_net_request, 'chrome: missing DNR rules');
      assert.equal(manifest.browser_specific_settings, undefined, 'chrome: unexpected Firefox metadata');
    } else {
      assert.ok(Array.isArray(manifest.background?.scripts), 'firefox: missing background scripts');
      assert.equal(manifest.background?.service_worker, undefined, 'firefox: unexpected service worker');
      assert.ok(manifest.browser_specific_settings?.gecko, 'firefox: missing metadata');
      assert.equal(manifest.declarative_net_request, undefined, 'firefox: unexpected DNR rules');
    }
  }

  const files = [
    ...manifest.content_scripts.flatMap((script) => [...(script.js ?? []), ...(script.css ?? [])]),
    ...(manifest.background.scripts ?? []),
    manifest.background.page,
    manifest.background.service_worker,
    manifest.options_ui?.page,
    manifest.action?.default_popup,
    manifest.browser_action?.default_popup,
    ...iconFiles(manifest.icons),
    ...iconFiles(manifest.action?.default_icon),
    ...iconFiles(manifest.browser_action?.default_icon),
    ...(manifest.declarative_net_request?.rule_resources ?? []).map((rule) => rule.path),
    'hyperchat/scripts/chat-interceptor.js',
    'hyperchat/scripts/chat-metagetter.js',
    'hyperchat/scripts/chat-translation-host.js',
    'hyperchat/index.html',
    'hyperchat/options.html',
    'hyperchat/logo-48.png',
    'ts/yt-workaround.js',
  ].filter((file) => typeof file === 'string');

  for (const file of new Set(files)) {
    await assertFile(buildDir, target, file);
    if (!file.endsWith('.html')) continue;
    const html = await readFile(path.join(buildDir, file), 'utf8');
    for (const [, reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(?:[a-z]+:|#)/i.test(reference)) continue;
      const asset = reference.startsWith('/') ? reference.slice(1) : path.join(path.dirname(file), reference);
      await assertFile(buildDir, target, asset);
    }
  }

  const injector = await readFile(path.join(buildDir, 'hyperchat/scripts/chat-injector.js'), 'utf8');
  const expectedChatPage = mv === 2 ? 'hyperchat/index.html' : 'youtube.com/embed/hyperchat_embed';
  assert.ok(injector.includes(expectedChatPage), `${target}: injector has wrong chat page`);
  assert.ok(injector.includes('hyperchat/scripts/'), `${target}: injector has wrong script base`);

  const chatMounter = await readFile(path.join(buildDir, 'hyperchat/scripts/chat-mounter.js'), 'utf8');
  assert.ok(chatMounter.includes('.dark\\\\:bg-ytbg-dark'), `${target}: missing HyperChat dark theme styles`);
}

assert.equal(versions.size, 1, 'build versions differ');
console.log('Verified Chrome MV3, Firefox MV3, and Firefox MV2 builds.');
