# LiveTL Release Playbook

## Sources and release assets

Each extension release comes from one GitHub Release on one tag pointing at
`main`:

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
YtcFilter, carry it into that workspace before release. Do not select different
source per browser for an extension release.

Release tags and matching workflows:

| Extension | Tags               | Workflow                                  | Build command                           |
| --------- | ------------------ | ----------------------------------------- | --------------------------------------- |
| LiveTL    | `livetl-vX.Y.Z`    | `.github/workflows/release-livetl.yml`    | `VERSION=X.Y.Z npm run build:livetl`    |
| HyperChat | `hyperchat-vX.Y.Z` | `.github/workflows/release-hyperchat.yml` | `VERSION=X.Y.Z npm run build:hyperchat` |
| YtcFilter | `ytcfilter-vX.Y.Z` | `.github/workflows/release-ytcfilter.yml` | `VERSION=X.Y.Z npm run build:ytcfilter` |

## Pre-release verification

From the exact `main` commit the release tag will point at, run the shared
checks:

```bash
npm ci
npm run format:check
npm run lint:check
npm run test
```

Use the matching build command:

```bash
VERSION=X.Y.Z npm run build:livetl
VERSION=X.Y.Z npm run build:hyperchat
VERSION=X.Y.Z npm run build:ytcfilter
```

Check the archive version for the extension being released:

```bash
unzip -p apps/LiveTL/build/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/LiveTL/build/LiveTL-Firefox-mv2.xpi manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-Firefox.xpi manifest.json | jq '.manifest_version, .version'
unzip -p apps/YtcFilter/build/YtcFilter-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/YtcFilter/build/YtcFilter-Firefox.xpi manifest.json | jq '.manifest_version, .version'
```

Expect LiveTL Chrome, HyperChat, and YtcFilter archives to use manifest version
`3`; LiveTL Firefox uses manifest version `2`. Every archive for the extension
being released should use the requested `X.Y.Z`.

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

Publish one GitHub Release for each extension being released. The release body
is the public update text for that extension, so do not replace this with a tag
push as the normal release path.

In the GitHub UI:

1. Draft a new release.
2. Choose or create the matching tag on the verified `main` commit.
3. Fill in that extension's release title and notes.
4. Publish the release.

CLI equivalent:

```bash
git switch main
git pull --ff-only
SHA="$(git rev-parse HEAD)"
gh release create livetl-vX.Y.Z --target "$SHA" --title "LiveTL vX.Y.Z" --notes-file livetl-notes.md
gh release create hyperchat-vX.Y.Z --target "$SHA" --title "HyperChat vX.Y.Z" --notes-file hyperchat-notes.md
gh release create ytcfilter-vX.Y.Z --target "$SHA" --title "YtcFilter vX.Y.Z" --notes-file ytcfilter-notes.md
```

Run only the commands for the extensions being released. Publishing a release
triggers the matching release workflow. It checks out that tag, strips the
extension prefix, strips any prerelease suffix to derive `VERSION`, builds that
extension, and uploads only that extension's release assets. Each release
workflow can be rerun manually with the existing release tag as its `tag` input.
