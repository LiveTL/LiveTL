# LiveTL Release Playbook

## Source and products

Every release comes from one tagged commit on `main`:

- `apps/LiveTL/dist/LiveTL-Chrome.zip`: LiveTL Chrome MV3
- `apps/LiveTL/dist/LiveTL-Firefox.zip`: LiveTL Firefox MV2
- `apps/HyperChat/build/HyperChat-chrome.zip`: HyperChat Chrome MV3
- `apps/HyperChat/build/HyperChat-firefox.zip`: HyperChat Firefox MV3

Firefox MV3 is built and verified from `build/firefox`, but is not published.
`develop` and `release` are retained legacy branches and are not part of normal
release assembly.

HyperChat and LiveTL source ship from the same monorepo commit. Never pin
different application revisions per browser.

## Pre-release verification

From the exact `main` commit to tag:

```bash
npm ci
npm run check
VERSION=X.Y.Z npm run build
npm run package -w @livetl/livetl
unzip -p apps/LiveTL/dist/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/LiveTL/dist/LiveTL-Firefox.zip manifest.json | jq '.manifest_version, .version'
```

Expect Chrome manifest version `3`, Firefox manifest version `2`, and the same
`X.Y.Z` in both archives.

## Publish

Create the release tag on the verified `main` commit, push it, then publish
the matching GitHub Release:

```bash
git switch main
git pull --ff-only
git tag vX.Y.Z
git push origin vX.Y.Z
```

Publishing the GitHub Release triggers `.github/workflows/release.yml`. It
checks out that tag, derives `VERSION` from it, builds all six targets, and
uploads exactly the four public ZIP names above. The workflow can be rerun
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
```

`develop` and `release` remain preserved legacy branches.
