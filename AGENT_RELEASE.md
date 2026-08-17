# LiveTL Release Playbook

## Source and products

Every release comes from one tagged commit on `main`:

- `apps/LiveTL/build/LiveTL-Chrome.zip`: Chrome MV3 from `apps/LiveTL/build/chrome`
- `apps/LiveTL/build/LiveTL-Firefox-mv2.xpi`: Firefox MV2 from `apps/LiveTL/build/mv2`
- `apps/HyperChat/build/HyperChat-Chrome.zip`: HyperChat Chrome MV3
- `apps/HyperChat/build/HyperChat-Firefox.xpi`: HyperChat Firefox MV3
- `apps/YtcFilter/build/YtcFilter-Chrome.zip`: YtcFilter Chrome MV3
- `apps/YtcFilter/build/YtcFilter-Firefox.xpi`: YtcFilter Firefox MV3

LiveTL Firefox MV3 and HyperChat Firefox MV2 are built and verified, but are not
published.
`develop` and `release` are retained legacy branches and are not part of normal
release assembly.

LiveTL and standalone HyperChat compile the same source from `apps/HyperChat`.
YtcFilter builds from `apps/YtcFilter`; when a HyperChat runtime fix applies to
YtcFilter, carry it into that workspace before tagging. Do not select different
source per browser for any product.

## Pre-release verification

From the exact `main` commit to tag:

```bash
npm ci
npm run format:check
npm run lint:check
npm run test
VERSION=X.Y.Z npm run build
unzip -p apps/LiveTL/build/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/LiveTL/build/LiveTL-Firefox-mv2.xpi manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-Firefox.xpi manifest.json | jq '.manifest_version, .version'
unzip -p apps/YtcFilter/build/YtcFilter-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/YtcFilter/build/YtcFilter-Firefox.xpi manifest.json | jq '.manifest_version, .version'
```

Expect both LiveTL Chrome and HyperChat/YtcFilter archives to use manifest
version `3`, LiveTL Firefox to use manifest version `2`, and all published
archives to use the same `X.Y.Z`.

## Artifact parity

HyperChat and YtcFilter do not yet have automated test suites, so their build
outputs are important regression oracles. For changes expected not to affect
shipped code, capture the published archives before the change and compare their
entries byte-for-byte afterward; matching file names and sizes are not enough to
catch same-size changes.

```bash
python3 -c "
import zipfile
for app, archives in {
    'HyperChat': ['HyperChat-Chrome.zip', 'HyperChat-Firefox.xpi'],
    'YtcFilter': ['YtcFilter-Chrome.zip', 'YtcFilter-Firefox.xpi'],
}.items():
    for name in archives:
        before = zipfile.ZipFile('/tmp/golden/' + name)
        after = zipfile.ZipFile('apps/' + app + '/build/' + name)
        entries = sorted(set(before.namelist()) | set(after.namelist()))
        changed = [n for n in entries if n not in before.namelist() or n not in after.namelist() or before.read(n) != after.read(n)]
        print(app, name, changed or 'all bytes match')
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
`VERSION`, builds all targets, and uploads exactly the public archive names
above. The workflow can be rerun manually with the existing release tag as its
`tag` input.
