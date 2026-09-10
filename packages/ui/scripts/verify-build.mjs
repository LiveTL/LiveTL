import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import componentNames from '../components.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const expectedExports = new Set(componentNames.map((name) => `./${name}`));
const componentExports = Object.entries(packageJson.exports).filter(
  ([, target]) => typeof target === 'object' && target !== null,
);
const actualExports = new Set(componentExports.map(([subpath]) => subpath));

const missingExports = [...expectedExports].filter((subpath) => !actualExports.has(subpath));
const unexpectedExports = [...actualExports].filter((subpath) => !expectedExports.has(subpath));

if (missingExports.length > 0 || unexpectedExports.length > 0) {
  throw new Error(
    `Component entry/export mismatch (missing: ${missingExports.join(', ') || 'none'}; unexpected: ${unexpectedExports.join(', ') || 'none'})`,
  );
}

for (const name of componentNames) {
  const subpath = `./${name}`;
  const targets = packageJson.exports[subpath];
  const paths = [`src/${name}.svelte`, `src/${name}.svelte.d.ts`, targets.import, targets.types];

  await Promise.all(paths.map((path) => access(resolve(packageRoot, path))));

  const output = await readFile(resolve(packageRoot, targets.import), 'utf8');
  if (output.includes('smelte/src/') || /from\s+["'][^"']*\.svelte["']/.test(output)) {
    throw new Error(`${subpath} contains an uncompiled source import`);
  }
}

await access(resolve(packageRoot, packageJson.exports['./styles.css']));

console.log(`Verified ${componentNames.length} compiled UI component exports.`);
