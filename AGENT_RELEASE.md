# LiveTL Release Playbook

## Source and products

Every release comes from one tagged commit on `main`:

- `apps/LiveTL/build/LiveTL-Chrome.zip`: Chrome MV3 from `apps/LiveTL/build/chrome`
- `apps/LiveTL/build/LiveTL-Firefox.xpi`: Firefox MV2 from `apps/LiveTL/build/mv2`
- `apps/HyperChat/build/HyperChat-chrome.zip`: HyperChat Chrome MV3
- `apps/HyperChat/build/HyperChat-firefox.xpi`: HyperChat Firefox MV3

LiveTL Firefox MV3 and HyperChat Firefox MV2 are built and verified, but are not
published.
`develop` and `release` are retained legacy branches and are not part of normal
release assembly.

LiveTL and standalone HyperChat compile the same source from `apps/HyperChat`.
Do not select different HyperChat or LiveTL source per browser.

## Pre-release verification

From the exact `main` commit to tag:

```bash
npm ci
npm run format:check
npm run lint:check
npm run test
VERSION=X.Y.Z npm run build
unzip -p apps/LiveTL/build/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/LiveTL/build/LiveTL-Firefox.xpi manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-firefox.xpi manifest.json | jq '.manifest_version, .version'
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
for name in ['HyperChat-chrome.zip', 'HyperChat-firefox.xpi']:
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
git pull --ff-only
git tag vX.Y.Z
git push origin vX.Y.Z
```

Publishing the GitHub Release triggers `.github/workflows/release.yml`. It
checks out that tag, strips the leading `v` and any prerelease suffix to derive
`VERSION`, builds all six targets, and
uploads exactly the four public archive names above. The workflow can be rerun
manually with the existing release tag as its `tag` input.
