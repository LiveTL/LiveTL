# LiveTL Release Playbook

## Source and products

Every release comes from one tagged commit on `main`:

- `apps/LiveTL/build/LiveTL-Chrome.zip`: Chrome MV3 from `apps/LiveTL/build/chrome`
- `apps/LiveTL/build/LiveTL-Firefox.zip`: Firefox MV2 from `apps/LiveTL/build/mv2`
- `apps/HyperChat/build/HyperChat-chrome.zip`: HyperChat Chrome MV3
- `apps/HyperChat/build/HyperChat-firefox.zip`: HyperChat Firefox MV3

LiveTL Firefox MV3 and HyperChat Firefox MV2 are built and verified, but are not
published.
`develop` and `release` are retained legacy branches and are not part of normal
release assembly.

Until LiveTL stops using the submodule, shared HyperChat changes must land in
upstream HyperChat first, be reflected in `apps/HyperChat`, and then update the
one `apps/LiveTL/src/submodules/chat` pointer. Do not pin different HyperChat or
LiveTL commits per browser.

## Pre-release verification

From the exact `main` commit to tag:

```bash
git submodule update --init --recursive
npm ci
npm run format:check
npm run test
VERSION=X.Y.Z npm run build
npm run package
unzip -p apps/LiveTL/build/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/LiveTL/build/LiveTL-Firefox.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-firefox.zip manifest.json | jq '.manifest_version, .version'
```

Expect both Chrome archives and HyperChat Firefox to use manifest version `3`,
LiveTL Firefox to use manifest version `2`, and all four archives to use the
same `X.Y.Z`.

## Artifact parity

HyperChat does not yet have an automated test suite, so its build output is an
important regression oracle. For changes expected not to affect shipped code,
capture the two published HyperChat archives before the change and compare
their entries byte-for-byte afterward; matching file names and sizes are not
enough to catch same-size changes.

```bash
python3 -c "
import zipfile
for name in ['HyperChat-chrome.zip', 'HyperChat-firefox.zip']:
    before = zipfile.ZipFile('/tmp/golden/' + name)
    after = zipfile.ZipFile('apps/HyperChat/build/' + name)
    names = sorted(set(before.namelist()) | set(after.namelist()))
    changed = [n for n in names if n not in before.namelist() or n not in after.namelist() or before.read(n) != after.read(n)]
    print(name, changed or 'all bytes match')
"
```

Reinstall with `npm ci` before creating both sides of an artifact comparison;
stale or different dependency trees invalidate the baseline.

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
checks out that tag, strips the leading `v` and any prerelease suffix to derive
`VERSION`, builds all six targets, and
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
git -C /tmp/livetl-restore-release submodule update --init --recursive
```

`develop` and `release` remain preserved legacy branches.
