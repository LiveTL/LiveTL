# HyperChat Release Process

Everything ships from `main`. There is no branch ladder — MV2 and MV3 are build
targets, not branches.

`mv3`, `mv3-ltl`, and `mv2` are historical branches. Do not route maintenance
through them; `mv2` below names the build target on `main`.

## Branch Order

1. Make and validate changes on `main`.
2. Push `main`.
3. Create and publish the release tag.

HyperChat and LiveTL live in one npm workspace. Changes to shared HyperChat
source must be validated against both products in the same pull request.

## Local Validation

```bash
npm ci
npm run check
VERSION=0.0.0 npm run build
```

Individual targets are `build:chrome`, `build:firefox`, and `build:mv2`. See
[README.md](./README.md) for what each one is for.

Reinstall after switching branches — stale installs can break builds, and the
artifact comparison below is only valid against the `node_modules` that produced
the baseline.

## Release Behavior

- Workflow: `.github/workflows/release.yml`
- Trigger: GitHub release event `published`, or `workflow_dispatch` with a tag
- Version comes from the **release tag**, not `package.json`: the workflow strips
  the leading `v` and any suffix, then passes it as `VERSION` so Vite writes it
  into each manifest at build time.

Practical rule: create a release tag like `v3.3.0` and publish it. The workflow
builds that version.

Published assets:

- `HyperChat-Chrome.zip` — MV3, Chrome Web Store
- `HyperChat-Firefox.zip` — MV3, Firefox Add-ons

The MV2 target is **not** published as a release asset. It is built on every push
so breakage is caught, including when the source is embedded by LiveTL.

## Verifying A Build

There is no test suite; build output is the oracle. To check that a change did
not move the shipped artifacts, capture a baseline before the change and compare
byte-for-byte after — file lists and sizes miss same-size changes:

```bash
python3 -c "
import zipfile
for b in ['HyperChat-chrome.zip','HyperChat-firefox.zip']:
    a=zipfile.ZipFile('/tmp/golden/'+b); c=zipfile.ZipFile('build/'+b)
    d=[n for n in sorted(set(a.namelist())) if a.read(n)!=c.read(n)]
    print(b, d or 'all bytes match')
"
```

## LiveTL Integration

LiveTL imports `apps/HyperChat/src` through the `@hyperchat` alias. Thin files
under `apps/LiveTL/src/submodules/chat` preserve existing manifest and archive
entry paths. Run both workspace jobs for every HyperChat source change.
