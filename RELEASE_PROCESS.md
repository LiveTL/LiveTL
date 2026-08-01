# HyperChat Release Process

Everything ships from `main`. There is no branch ladder — MV2 and MV3 are build
targets, not branches.

`mv3` and `mv3-ltl` are historical. The remote `mv2` branch is rollback-only
until LiveTL migration and runtime validation finish; do not route maintenance
through it or delete it early.

## Branch Order

1. Make and validate changes on `main`.
2. Push `main`.
3. Create and publish the release tag.

If the same task also affects LiveTL, do not begin in LiveTL. Finish HyperChat
first, then bump the LiveTL submodule chain in this order:

1. LiveTL `develop`
2. LiveTL `mv3-fr`
3. LiveTL `release`

HyperChat is the upstream source for shared chat behavior. LiveTL is downstream
packaging/integration work after that.

## Local Validation

```bash
npm ci
VERSION=0.0.0 npm run build   # chrome + firefox (MV3) + mv2, in parallel
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
by `.github/workflows/build.yml` (via `npm run build`) so breakage is caught, and
LiveTL consumes it through a git submodule rather than a download.

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

## Notes For LiveTL Sync

LiveTL consumes HyperChat via git submodules, not release assets. Its MV2 Firefox
variant and MV3 line will both track `main` after the downstream migration. Until
their release pins and runtime checks pass, keep the remote `mv2` rollback branch.
