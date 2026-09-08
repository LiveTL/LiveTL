import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { prepareRelease } from './prepare-release.mjs';

const script = fileURLToPath(new URL('./prepare-release.mjs', import.meta.url));
const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const readJson = (repo, ref, file) => JSON.parse(git(repo, 'show', `${ref}:${file}`));
const commit = (repo, message) => {
  git(repo, 'add', '.');
  git(repo, '-c', 'commit.gpgsign=false', 'commit', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
};

function fixture(t) {
  const directory = mkdtempSync(path.join(tmpdir(), 'release-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const remote = path.join(directory, 'remote.git');
  const repo = path.join(directory, 'checkout');
  git(directory, 'init', '--bare', '--initial-branch=main', remote);
  const clone = (destination) => {
    git(directory, 'clone', remote, destination);
    git(destination, 'config', 'user.name', 'Test');
    git(destination, 'config', 'user.email', 'test@example.com');
  };
  clone(repo);
  const lock = { name: 'monorepo', lockfileVersion: 3, packages: {} };
  for (const app of ['HyperChat', 'LiveTL', 'YtcFilter']) {
    mkdirSync(path.join(repo, 'apps', app), { recursive: true });
    const pkg = { name: app, version: '1.0.0', scripts: { build: 'original build' } };
    writeJson(path.join(repo, 'apps', app, 'package.json'), pkg);
    lock.packages[`apps/${app}`] = { name: app, version: '1.0.0', dependencies: { example: '1.0.0' } };
  }
  writeJson(path.join(repo, 'package-lock.json'), lock);
  writeFileSync(path.join(repo, 'source.txt'), 'release source');
  const base = commit(repo, 'initial');
  git(repo, 'push', 'origin', 'main');
  const tag = (name, annotated = false) => {
    git(repo, 'tag', ...(annotated ? ['-a', '-m', 'release'] : []), name, base);
    git(repo, 'push', 'origin', `refs/tags/${name}`);
  };
  return { directory, remote, repo, base, clone, tag };
}

for (const [prefix, app] of [
  ['hyperchat', 'HyperChat'],
  ['livetl', 'LiveTL'],
  ['ytcfilter', 'YtcFilter'],
]) {
  test(`${app}: stamp only its version and reuse the commit on reruns`, (t) => {
    const f = fixture(t);
    const tag = `${prefix}-v2.0.0-beta1`;
    f.tag(tag, true);
    const result = prepareRelease(tag, f.repo);
    assert.equal(result.version, '2.0.0');
    assert.equal(git(f.remote, 'rev-parse', 'main'), result.sha);
    assert.equal(git(f.remote, 'rev-parse', tag), result.sha);
    assert.equal(git(f.remote, 'rev-parse', `${tag}^`), f.base);
    assert.equal(git(f.remote, 'log', '-1', '--format=%an', tag), 'github-actions[bot]');
    assert.deepEqual(git(f.remote, 'diff', '--name-only', f.base, tag).split('\n'), [
      `apps/${app}/package.json`,
      'package-lock.json',
    ]);
    const before = readJson(f.remote, f.base, `apps/${app}/package.json`);
    assert.deepEqual(readJson(f.remote, tag, `apps/${app}/package.json`), { ...before, version: '2.0.0' });
    const lock = readJson(f.remote, f.base, 'package-lock.json');
    lock.packages[`apps/${app}`].version = '2.0.0';
    assert.deepEqual(readJson(f.remote, tag, 'package-lock.json'), lock);
    assert.deepEqual(prepareRelease(tag, f.repo), result);
    assert.equal(git(f.remote, 'rev-list', '--count', '--all'), '2');
  });
}

test('matching metadata needs no commit or tag change', (t) => {
  const f = fixture(t);
  const tag = 'hyperchat-v1.0.0';
  f.tag(tag, true);
  const originalTag = git(f.remote, 'rev-parse', tag);
  assert.deepEqual(prepareRelease(tag, f.repo), { sha: f.base, version: '1.0.0' });
  assert.equal(git(f.remote, 'rev-parse', tag), originalTag);
  assert.equal(git(f.remote, 'rev-list', '--count', '--all'), '1');
});

test('advanced main retains its code and metadata; the tag retains the selected source', (t) => {
  const f = fixture(t);
  const tag = 'hyperchat-v2.0.0';
  f.tag(tag);
  const pkg = readJson(f.repo, 'HEAD', 'apps/HyperChat/package.json');
  pkg.scripts.build = 'new build';
  writeJson(path.join(f.repo, 'apps/HyperChat/package.json'), pkg);
  const lock = readJson(f.repo, 'HEAD', 'package-lock.json');
  lock.packages['apps/HyperChat'].dependencies.example = '2.0.0';
  writeJson(path.join(f.repo, 'package-lock.json'), lock);
  writeFileSync(path.join(f.repo, 'source.txt'), 'later source');
  const advanced = commit(f.repo, 'later changes');
  git(f.repo, 'push', 'origin', 'main');

  const { sha } = prepareRelease(tag, f.repo);
  assert.equal(git(f.remote, 'show', `${sha}:source.txt`), 'release source');
  assert.equal(git(f.remote, 'show', 'main:source.txt'), 'later source');
  assert.equal(git(f.remote, 'show', '-s', '--format=%P', 'main'), `${advanced} ${sha}`);
  assert.equal(git(f.remote, 'rev-parse', `${sha}^`), f.base);
  pkg.version = '2.0.0';
  lock.packages['apps/HyperChat'].version = '2.0.0';
  assert.deepEqual(readJson(f.remote, 'main', 'apps/HyperChat/package.json'), pkg);
  assert.deepEqual(readJson(f.remote, 'main', 'package-lock.json'), lock);
  assert.equal(readJson(f.remote, sha, 'apps/HyperChat/package.json').scripts.build, 'original build');
  const main = git(f.remote, 'rev-parse', 'main');
  prepareRelease(tag, f.repo);
  assert.equal(git(f.remote, 'rev-parse', 'main'), main);
});

test('an older release cannot downgrade main', (t) => {
  const f = fixture(t);
  f.tag('hyperchat-v3.0.0');
  f.tag('hyperchat-v2.0.0');
  const newer = prepareRelease('hyperchat-v3.0.0', f.repo);
  const older = prepareRelease('hyperchat-v2.0.0', f.repo);
  assert.equal(readJson(f.remote, 'main', 'apps/HyperChat/package.json').version, '3.0.0');
  assert.equal(readJson(f.remote, 'main', 'package-lock.json').packages['apps/HyperChat'].version, '3.0.0');
  assert.equal(readJson(f.remote, older.sha, 'apps/HyperChat/package.json').version, '2.0.0');
  assert.equal(git(f.remote, 'show', '-s', '--format=%P', 'main'), `${newer.sha} ${older.sha}`);
});

test('competing releases retry without losing either version or pulling newer code into a tag', (t) => {
  const f = fixture(t);
  f.tag('hyperchat-v2.0.0');
  f.tag('livetl-v3.0.0');
  const other = path.join(f.directory, 'other');
  f.clone(other);
  const output = path.join(f.directory, 'output');
  const hook = path.join(f.repo, '.git/hooks/pre-push');
  writeFileSync(
    hook,
    `#!/bin/sh
rm -- "$0"
cd "${other}"
RELEASE_TAG=livetl-v3.0.0 GITHUB_OUTPUT="${output}" "${process.execPath}" "${script}"
`,
    { mode: 0o755 },
  );

  const hc = prepareRelease('hyperchat-v2.0.0', f.repo);
  const ltl = Object.fromEntries(
    readFileSync(output, 'utf8')
      .trim()
      .split('\n')
      .map((line) => line.split('=')),
  );
  const lock = readJson(f.remote, 'main', 'package-lock.json');
  assert.equal(lock.packages['apps/HyperChat'].version, '2.0.0');
  assert.equal(lock.packages['apps/LiveTL'].version, '3.0.0');
  assert.equal(readJson(f.remote, 'main', 'apps/HyperChat/package.json').version, '2.0.0');
  assert.equal(readJson(f.remote, 'main', 'apps/LiveTL/package.json').version, '3.0.0');
  assert.equal(git(f.remote, 'show', '-s', '--format=%P', 'main'), `${ltl.sha} ${hc.sha}`);
  assert.equal(git(f.remote, 'rev-parse', `${hc.sha}^`), f.base);
  assert.equal(git(f.remote, 'rev-parse', `${ltl.sha}^`), f.base);
  assert.equal(readJson(f.remote, ltl.sha, 'apps/HyperChat/package.json').version, '1.0.0');
});

test('a rejected tag update cannot partially update main', (t) => {
  const f = fixture(t);
  const tag = 'ytcfilter-v2.0.0';
  f.tag(tag);
  writeFileSync(path.join(f.remote, 'hooks/pre-receive'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
  assert.throws(() => prepareRelease(tag, f.repo), /declined|failed/);
  assert.equal(git(f.remote, 'rev-parse', 'main'), f.base);
  assert.equal(git(f.remote, 'rev-parse', tag), f.base);
  assert.equal(git(f.repo, 'worktree', 'list', '--porcelain').match(/^worktree /gm).length, 1);
});

test('a tag changed by someone else is not overwritten', (t) => {
  const f = fixture(t);
  const tag = 'hyperchat-v2.0.0';
  f.tag(tag);
  const other = path.join(f.directory, 'other');
  f.clone(other);
  writeFileSync(path.join(other, 'source.txt'), 'new release choice');
  const moved = commit(other, 'choose another commit');
  writeFileSync(
    path.join(f.repo, '.git/hooks/pre-push'),
    `#!/bin/sh
rm -- "$0"
git -C "${other}" push --force origin HEAD:refs/tags/${tag}
`,
    { mode: 0o755 },
  );
  assert.throws(() => prepareRelease(tag, f.repo), /Release tag changed/);
  assert.equal(git(f.remote, 'rev-parse', tag), moved);
  assert.equal(git(f.remote, 'rev-parse', 'main'), f.base);
});

test('reject invalid tags before changing anything', (t) => {
  const f = fixture(t);
  for (const tag of ['v2.0.0', 'hyperchat-v2', 'livetl-v01.0.0', 'ytcfilter-v2.0.0\n', undefined]) {
    assert.throws(() => prepareRelease(tag, f.repo));
  }
  assert.equal(git(f.remote, 'rev-list', '--count', '--all'), '1');
});
