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
    id: '{14a15c41-13f4-498e-986c-7f00435c4d00}',
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

const referencedIcons = (value) =>
  typeof value === 'string' ? [value] : Object.values(value ?? {}).flatMap(referencedIcons);

for (const target of ['chrome', 'firefox', 'mv2']) {
  const buildDir = path.resolve('build', target);
  const manifest = JSON.parse(await readFile(path.join(buildDir, 'manifest.json'), 'utf8'));
  const mv = target === 'mv2' ? 2 : 3;

  assert.equal(manifest.manifest_version, mv, `${target}: wrong manifest version`);
  assert.deepEqual(unresolvedKeys(manifest), [], `${target}: unresolved manifest key`);

  if (target === 'chrome') {
    assert.equal(typeof manifest.background?.service_worker, 'string', 'chrome: missing service worker');
    assert.equal(manifest.background?.scripts, undefined, 'chrome: unexpected background scripts');
  } else {
    assert.ok(Array.isArray(manifest.background?.scripts), `${target}: missing background scripts`);
    assert.equal(manifest.background?.service_worker, undefined, `${target}: unexpected service worker`);
  }

  if (mv === 2) {
    assert.equal(manifest.background.persistent, true, 'mv2: background must be persistent');
    assert.ok(manifest.browser_action, 'mv2: missing browser_action');
    assert.equal(manifest.action, undefined, 'mv2: unexpected action');
    assert.equal(manifest.host_permissions, undefined, 'mv2: unexpected host permissions');
    assert.equal(manifest.browser_specific_settings, undefined, 'mv2: unexpected Firefox metadata');
    assert.deepEqual(manifest.web_accessible_resources, ['*'], 'mv2: wrong web-accessible resources');
  } else {
    assert.equal(manifest.background.persistent, undefined, `${target}: persistent background`);
    assert.ok(manifest.action, `${target}: missing action`);
    assert.equal(manifest.browser_action, undefined, `${target}: unexpected browser_action`);
    assert.deepEqual(manifest.host_permissions, hostPermissions, `${target}: wrong host permissions`);
    assert.ok(manifest.web_accessible_resources?.[0]?.resources, `${target}: wrong web-accessible resources`);
    if (target === 'firefox') {
      assert.deepEqual(manifest.browser_specific_settings, firefoxSettings, 'firefox: wrong metadata');
    } else {
      assert.equal(manifest.browser_specific_settings, undefined, 'chrome: unexpected Firefox metadata');
    }
  }

  const files = [
    ...manifest.content_scripts.flatMap((script) => [...(script.js ?? []), ...(script.css ?? [])]),
    ...(manifest.background.scripts ?? []),
    manifest.background.service_worker,
    manifest.options_page,
    manifest.options_ui?.page,
    manifest.action?.default_popup,
    manifest.browser_action?.default_popup,
    ...referencedIcons(manifest.icons),
    ...referencedIcons(manifest.action?.default_icon),
    ...referencedIcons(manifest.browser_action?.default_icon),
  ].filter((file) => typeof file === 'string');

  for (const file of files) {
    await assert.doesNotReject(access(path.join(buildDir, file)), `${target}: missing ${file}`);
  }
}

console.log('Verified chrome, firefox, and mv2 builds.');
