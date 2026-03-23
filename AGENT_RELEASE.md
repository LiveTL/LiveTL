# LiveTL Release Playbook (Agent-Focused)

This file documents how LiveTL releases are assembled across MV2 + MV3 lines.

## Branch Roles

- `develop`:
  - MV2 implementation branch
  - Firefox-oriented runtime line
- `mv3-fr`:
  - MV3 implementation branch
  - Chromium-oriented runtime line
- `release`:
  - release assembly branch
  - contains only submodule pointers:
    - `firefox-mv2` -> LiveTL commit on `develop`
    - `chrome-mv3` -> LiveTL commit on `mv3-fr`
  - runs the publish workflow that uploads both browser artifacts

## Current CI/Publishing Model

As of recent tags (for example `v9.0.9`), published tags are on `release` and artifacts are produced by `release/.github/workflows/release.yaml`.

Release workflow behavior:

1. Check out `release` with submodules.
2. Build Firefox artifact from `firefox-mv2` submodule:
   - inject tag version into `package.json`
   - run `yarn update:list`
   - run `yarn build:production`
   - run `yarn package`
3. Build Chrome artifact from `chrome-mv3` submodule:
   - run `yarn update:list`
   - pass tag version through `VERSION=... yarn build:chrome`
   - run `yarn package`
4. Upload `LiveTL-Firefox.zip` and `LiveTL-Chrome.zip` to the GitHub release.

## Version Semantics

- MV2 (`develop`):
  - local build version source: `package.json`
  - release workflow rewrites `package.json` version to match the release tag
- MV3 (`mv3-fr`):
  - build version source: `VERSION` env var in Vite config
  - fallback source if `VERSION` missing: `src/manifest.json`

Implication: tag value on `release` is the single source of truth for published artifact versions.

## Feature Delivery Flow (Mandatory)

1. Implement and validate on `develop`.
2. Commit and push `develop`.
3. Merge `develop` into `mv3-fr`.
4. Adapt for MV3 differences, validate, commit, and push `mv3-fr`.
5. Update `release` branch submodule pointers to those exact commits.
6. Commit and push `release`.
7. Create/push tag (for example `v9.0.10`) on `release`.
8. Publish GitHub release for that tag.

## Updating the `release` Branch Pointers

From a clean repo:

```bash
git checkout release
git pull --recurse-submodules

cd firefox-mv2
git fetch origin
git checkout <develop_commit_sha>
cd ..

cd chrome-mv3
git fetch origin
git checkout <mv3_fr_commit_sha>
cd ..

git add firefox-mv2 chrome-mv3
git commit -m "vX.Y.Z"
git push origin release
```

Then tag/publish:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

Publish the GitHub release for `vX.Y.Z` to trigger upload automation.

## Local Pre-Release Verification

Before updating `release`:

- On `develop` commit:
  - `sudo yarn`
  - `sudo yarn build:production`
  - `sudo yarn package`
- On `mv3-fr` commit:
  - `sudo yarn`
  - `sudo yarn build:chrome`
  - `sudo yarn package`

Quick zip sanity check:

```bash
unzip -p dist/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p dist/LiveTL-Firefox.zip manifest.json | jq '.manifest_version, .version'
```

## Common Failure Modes

- Wrong branch order:
  - fixing only `mv3-fr` first causes divergence from MV2 source branch.
- Stale submodule state:
  - forgetting `git submodule update --init --recursive` after branch switch.
- Incorrect release branch:
  - tagging `develop` or `mv3-fr` directly bypasses the dual-submodule publish pipeline.
- Version mismatch:
  - expecting `mv3-fr/src/manifest.json` alone to control release version in CI.
