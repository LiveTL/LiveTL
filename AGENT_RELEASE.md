# LiveTL Release Playbook

## Sources and release assets

Each extension release comes from one GitHub Release created from a verified
commit on `main`:

- `apps/LiveTL/build/LiveTL-Chrome.zip`: Chrome MV3 from `apps/LiveTL/build/chrome`
- `apps/LiveTL/build/LiveTL-Firefox-mv2.zip`: Firefox MV2 from `apps/LiveTL/build/mv2`
- `apps/HyperChat/build/HyperChat-Chrome.zip`: HyperChat Chrome MV3
- `apps/HyperChat/build/HyperChat-Firefox.zip`: HyperChat Firefox MV3
- `apps/YtcFilter/build/YtcFilter-Chrome.zip`: YtcFilter Chrome MV3
- `apps/YtcFilter/build/YtcFilter-Firefox.zip`: YtcFilter Firefox MV3

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

Prerelease tags use the same prefixes with a suffix, such as
`livetl-v10.0.0-beta1`, `hyperchat-v4.0.0-beta1`, or
`ytcfilter-v4.0.0-beta1`. The GitHub Release keeps the full prerelease tag, but
the release workflows strip both the extension prefix and any suffix after `-`
before setting `VERSION`, so the built extension manifests use `10.0.0`,
`4.0.0`, and `4.0.0` for those examples.

## Recorded versions

Each app's `package.json` records its own version. The matching entry under
`packages` in the root `package-lock.json` must agree. Local builds use that
version unless `VERSION` is supplied; `src/manifest.json` is a template, not the
version source.

HyperChat's UI and update tracking use `__HC_VERSION__`. Standalone builds set
it from their release version. LiveTL builds set it from
`apps/HyperChat/package.json`, independently of LiveTL's own `__VERSION__`.
An HC version change must also invalidate LiveTL's build cache.

Publishing a release runs `.github/scripts/prepare-release.mjs` before the build:

1. Read the selected tag's commit and normalize its version.
2. Make a bot commit changing only that app's package version and lock entry.
   Skip the commit if both already match.
3. Immediately move the existing release tag to that commit and carry the
   commit into `main` in one atomic push, before installing or building.
4. Explicitly check out the returned commit SHA, build, and upload to the same
   release. Its title, notes, and prerelease setting are unchanged.

If `main` advanced, the release commit still has the selected source as its
parent. A separate merge carries it into `main`, preserving newer code and
versions there. Concurrent updates are retried; a changed tag or rejected push
fails without partially updating the refs. Reruns reuse the recorded commit.

Tag updates must be allowed and GitHub immutable releases must remain disabled
for this flow. A build failure leaves the version commit and tag in place;
rerun the workflow rather than creating another version commit.

When releasing HC and LiveTL together, publish HC first and wait for its workflow
to succeed. Then create LiveTL's release from updated `main`, which contains
the recorded HC version. Creating both tags from the old commit would leave
LiveTL's bundled HC version unchanged. YtcFilter is independent. No workflow
automatically publishes either of the other extensions.

## Pre-release verification

From the exact `main` commit the release tag will point at, run the shared
checks:

```bash
npm ci
npm run format:check
npm run lint:check
node --test .github/scripts/prepare-release.test.mjs
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
unzip -p apps/LiveTL/build/LiveTL-Firefox-mv2.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/HyperChat/build/HyperChat-Firefox.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/YtcFilter/build/YtcFilter-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p apps/YtcFilter/build/YtcFilter-Firefox.zip manifest.json | jq '.manifest_version, .version'
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
GOLDEN_DIR="${GOLDEN_DIR:?set GOLDEN_DIR to the baseline archive directory}" python3 - <<'PY'
import os
import zipfile

golden_dir = os.environ['GOLDEN_DIR']
for app, archives in {
    'HyperChat': ['HyperChat-Chrome.zip', 'HyperChat-Firefox.zip'],
    'YtcFilter': ['YtcFilter-Chrome.zip', 'YtcFilter-Firefox.zip'],
}.items():
    for name in archives:
        before = zipfile.ZipFile(os.path.join(golden_dir, name))
        after = zipfile.ZipFile('apps/' + app + '/build/' + name)
        entries = sorted(set(before.namelist()) | set(after.namelist()))
        changed = [n for n in entries if n not in before.namelist() or n not in after.namelist() or before.read(n) != after.read(n)]
        print(app, name, changed or 'all bytes match')
PY
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
gh release create hyperchat-vX.Y.Z --target "$SHA" --title "HyperChat vX.Y.Z" --notes-file hyperchat-notes.md
```

Use `livetl-vX.Y.Z` / `LiveTL vX.Y.Z` / `livetl-notes.md` or
`ytcfilter-vX.Y.Z` / `YtcFilter vX.Y.Z` / `ytcfilter-notes.md` for the other
extensions, with their own version numbers. Pull and select the source again
between releases that need the newly recorded HC version. Add `--prerelease`
and the desired tag suffix for a beta.

Publishing triggers only the matching release build, which uploads only that
extension's assets. Each workflow can be rerun with its existing release tag as
the manual `tag` input. After a workflow moves a tag, refresh that local tag
explicitly before inspecting it:

```bash
git fetch origin "+refs/tags/hyperchat-vX.Y.Z:refs/tags/hyperchat-vX.Y.Z"
git pull --ff-only
```
