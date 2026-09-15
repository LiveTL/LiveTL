import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const apps = { hyperchat: 'HyperChat', livetl: 'LiveTL', ytcfilter: 'YtcFilter' };

export function prepareRelease(tag, repository = process.cwd()) {
  const match = /^(hyperchat|livetl|ytcfilter)-v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))(?:-[\w.-]+)?$/.exec(
    tag,
  );
  assert.ok(
    match && match[0] === tag,
    'Expected an extension release tag ending in vX.Y.Z, optionally with a prerelease suffix',
  );
  const [, app, version] = match;
  const workspace = `apps/${apps[app]}`;
  const files = [`${workspace}/package.json`, 'package-lock.json'];
  const tagRef = `refs/tags/${tag}`;
  const mainRef = 'refs/heads/main';

  const run = (cwd, args) =>
    spawnSync(
      'git',
      [
        '-c',
        'user.name=github-actions[bot]',
        '-c',
        'user.email=41898282+github-actions[bot]@users.noreply.github.com',
        '-c',
        'commit.gpgsign=false',
        ...args,
      ],
      { cwd, encoding: 'utf8' },
    );
  const git = (cwd, ...args) => {
    const result = run(cwd, args);
    assert.equal(result.status, 0, result.error?.message ?? result.stderr + result.stdout);
    return result.stdout.trim();
  };
  const ancestor = (a, b) => {
    const result = run(repository, ['merge-base', '--is-ancestor', a, b]);
    assert.ok(result.status === 0 || result.status === 1, result.stderr);
    return result.status === 0;
  };
  const fetch = () =>
    git(repository, 'fetch', '--no-tags', 'origin', `+${mainRef}:refs/remotes/origin/main`, `+${tagRef}:${tagRef}`);
  const metadata = (ref) => files.map((file) => JSON.parse(git(repository, 'show', `${ref}:${file}`)));
  const writeVersion = (cwd, data, nextVersion) => {
    assert.equal(typeof data[0].version, 'string', 'Missing workspace version');
    assert.equal(typeof data[1].packages?.[workspace]?.version, 'string', 'Missing workspace lock version');
    data[0].version = nextVersion;
    data[1].packages[workspace].version = nextVersion;
    files.forEach((file, i) => writeFileSync(path.join(cwd, file), `${JSON.stringify(data[i], null, 2)}\n`));
    git(cwd, 'add', '--', ...files);
  };

  fetch();
  const originalTag = git(repository, 'rev-parse', tagRef);
  const base = git(repository, 'rev-parse', `${tagRef}^{commit}`);
  assert.ok(ancestor(base, 'origin/main'), 'Release source must be part of main');
  const data = metadata(base);
  if (data[0].version === version && data[1].packages?.[workspace]?.version === version) {
    return { sha: base, version };
  }

  const temporary = mkdtempSync(path.join(tmpdir(), 'release-version-'));
  const releaseTree = path.join(temporary, 'release');
  const mainTree = path.join(temporary, 'main');
  try {
    git(repository, 'worktree', 'add', '--detach', releaseTree, base);
    writeVersion(releaseTree, data, version);
    git(releaseTree, 'commit', '-m', `${app} v${version}`);
    const sha = git(releaseTree, 'rev-parse', 'HEAD');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      fetch();
      assert.equal(git(repository, 'rev-parse', tagRef), originalTag, 'Release tag changed during preparation');
      const main = git(repository, 'rev-parse', 'origin/main');
      assert.ok(ancestor(base, main), 'Release source is no longer part of main');
      let nextMain = sha;
      if (ancestor(sha, main)) {
        nextMain = main;
      } else if (main !== base) {
        // Keep main's other changes, including newer versions when rebuilding an older release.
        const current = metadata(main);
        const currentParts = current[0].version.split('.').map(Number);
        const releaseParts = version.split('.').map(Number);
        assert.ok(/^\d+\.\d+\.\d+$/.test(current[0].version), 'Invalid version on main');
        const difference = currentParts.map((n, i) => n - releaseParts[i]).find((n) => n !== 0) ?? 0;
        const mainVersion = difference > 0 ? current[0].version : version;
        git(repository, 'worktree', 'add', '--detach', mainTree, main);
        try {
          const merge = run(mainTree, ['merge', '--no-ff', '--no-commit', sha]);
          const conflicts = git(mainTree, 'diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
          assert.ok(merge.status === 0 || (merge.status === 1 && conflicts.length > 0), merge.stderr);
          assert.ok(
            conflicts.every((file) => files.includes(file)),
            'Unexpected release merge conflict',
          );
          writeVersion(mainTree, current, mainVersion);
          git(mainTree, 'commit', '-m', `merge ${tag}`);
          nextMain = git(mainTree, 'rev-parse', 'HEAD');
        } finally {
          git(repository, 'worktree', 'remove', '--force', mainTree);
        }
      }
      assert.ok(ancestor(main, nextMain), 'Refusing to rewrite main');
      const push = run(repository, [
        'push',
        '--atomic',
        `--force-with-lease=${mainRef}:${main}`,
        `--force-with-lease=${tagRef}:${originalTag}`,
        'origin',
        `${nextMain}:${mainRef}`,
        `${sha}:${tagRef}`,
      ]);
      if (push.status === 0) {
        return { sha, version };
      }
      fetch();
      assert.equal(git(repository, 'rev-parse', tagRef), originalTag, 'Release tag changed during preparation');
      assert.notEqual(git(repository, 'rev-parse', 'origin/main'), main, push.stderr);
    }
    throw new Error('Main kept changing; rerun release preparation');
  } finally {
    run(repository, ['worktree', 'remove', '--force', releaseTree]);
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  assert.ok(process.env.GITHUB_OUTPUT, 'Missing GITHUB_OUTPUT');
  const result = prepareRelease(process.env.RELEASE_TAG);
  appendFileSync(process.env.GITHUB_OUTPUT, `sha=${result.sha}\nversion=${result.version}\n`);
  console.log(`Build ${process.env.RELEASE_TAG} from ${result.sha}`);
}
