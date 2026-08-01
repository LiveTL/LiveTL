# LiveTL Release Playbook

## Source and products

Every release comes from one tagged commit on `main`:

- `dist/LiveTL-Chrome.zip`: Chrome MV3 from `build/chrome`
- `dist/LiveTL-Firefox.zip`: Firefox MV2 from `build/mv2`

Firefox MV3 is built and verified from `build/firefox`, but is not published.
`develop` and `release` are retained legacy branches and are not part of normal
release assembly.

If HyperChat changes are required, merge them to HyperChat `main` first and bump
the one `src/submodules/chat` pointer on LiveTL `main`. Do not pin different
HyperChat or LiveTL commits per browser.

## Pre-release verification

From the exact `main` commit to tag:

```bash
git submodule update --init --recursive
yarn --frozen-lockfile
yarn format:check
yarn test
VERSION=X.Y.Z yarn build
yarn package
unzip -p dist/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p dist/LiveTL-Firefox.zip manifest.json | jq '.manifest_version, .version'
```

Expect Chrome manifest version `3`, Firefox manifest version `2`, and the same
`X.Y.Z` in both archives.

## Publish

Create the release tag on the verified `main` commit, push it, then publish
the matching GitHub Release:

```bash
git switch main
git pull --ff-only --recurse-submodules
git tag vX.Y.Z
git push origin vX.Y.Z
```

Publishing the GitHub Release triggers `.github/workflows/release.yml`. It
checks out that tag, derives `VERSION` from it, builds all three targets, and
uploads exactly the two public ZIP names above. The workflow can be rerun
manually with the existing release tag as its `tag` input.

## Rollback

The planned rollback tags were not created before the unification merge. The
immutable pre-unification branch tips are:

- `develop`: `5aba0f06`
- former `mv3-fr`: `5bfbe103`
- `release`: `5c23f81b`

If the old publishing layout must be restored, recreate `release` from its
pre-unification commit in a separate worktree and push it only after
verification:

```bash
git worktree add -b restore-release /tmp/livetl-restore-release 5c23f81b
git -C /tmp/livetl-restore-release submodule update --init --recursive
```

`develop` and `release` remain preserved legacy branches.
