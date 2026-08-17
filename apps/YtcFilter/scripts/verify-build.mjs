/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const hostPermissions = [
  'https://www.youtube.com/live_chat*',
  'https://www.youtube.com/live_chat_replay*',
  'https://studio.youtube.com/live_chat*',
  'https://studio.youtube.com/live_chat_replay*',
];
const firefoxSettings = {
  gecko: {
    id: '{20f2dcdf-6f8d-4aeb-862b-b13174475d9c}',
    strict_min_version: '115.0',
  },
};

const unresolvedKeys = (value, result = []) => {
  if (Array.isArray(value)) {
    value.forEach((child) => unresolvedKeys(child, result));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (/\{\{[^}]+\}\}\./.test(key)) result.push(key);
      unresolvedKeys(child, result);
    }
  }
  return result;
};

for (const target of ['chrome', 'firefox']) {
  const buildDir = path.resolve('build', target);
  const manifest = JSON.parse(await readFile(path.join(buildDir, 'manifest.json'), 'utf8'));

  assert.equal(manifest.manifest_version, 3, `${target}: wrong manifest version`);
  assert.deepEqual(unresolvedKeys(manifest), [], `${target}: unresolved manifest key`);
  assert.equal(manifest.background?.persistent, undefined, `${target}: persistent background`);
  assert.ok(manifest.action, `${target}: missing action`);
  assert.deepEqual(manifest.host_permissions, hostPermissions, `${target}: wrong host permissions`);
  assert.ok(manifest.permissions.includes('storage'), `${target}: missing storage permission`);
  assert.ok(manifest.permissions.includes('unlimitedStorage'), `${target}: missing unlimited storage permission`);
  assert.ok(manifest.web_accessible_resources?.[0]?.resources, `${target}: wrong web-accessible resources`);

  if (target === 'chrome') {
    assert.equal(typeof manifest.background?.service_worker, 'string', 'chrome: missing service worker');
    assert.equal(manifest.background?.scripts, undefined, 'chrome: unexpected background scripts');
    assert.equal(manifest.browser_specific_settings, undefined, 'chrome: unexpected Firefox metadata');
  } else {
    assert.ok(Array.isArray(manifest.background?.scripts), 'firefox: missing background scripts');
    assert.equal(manifest.background?.service_worker, undefined, 'firefox: unexpected service worker');
    assert.deepEqual(manifest.browser_specific_settings, firefoxSettings, 'firefox: wrong metadata');
  }

  const files = [
    ...manifest.content_scripts.flatMap((script) => [...(script.js ?? []), ...(script.css ?? [])]),
    ...(manifest.background.scripts ?? []),
    manifest.background.service_worker,
    manifest.options_ui?.page,
    manifest.action?.default_popup,
  ].filter((file) => typeof file === 'string');

  for (const file of files) {
    await assert.doesNotReject(access(path.join(buildDir, file)), `${target}: missing ${file}`);
  }
}

console.log('Verified YtcFilter chrome and firefox builds.');
