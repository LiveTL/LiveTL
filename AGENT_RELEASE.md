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

## Sync Order (Mandatory)

Use this exact ladder for maintenance work:

1. Sync HyperChat `mv2`.
2. Merge/adapt HyperChat into `mv3`.
3. Merge/adapt HyperChat into `mv3-ltl`.
4. Bump LiveTL `develop` to the new HyperChat `mv2` commit.
5. Merge `develop` into `mv3-fr`, then ensure `src/submodules/chat` points at HyperChat `mv3-ltl`.
6. Bump LiveTL `release` so:
   - `firefox-mv2` == LiveTL `develop`
   - `chrome-mv3` == LiveTL `mv3-fr`

Do not bump `release` first and do not point LiveTL `mv3-fr` directly at HyperChat `mv3` when `mv3-ltl` exists.
Do not begin in LiveTL at all if the corresponding HyperChat work has not been landed yet.

## Current CI/Publishing Model

Published tags belong on `release`, and artifacts are produced by `release/.github/workflows/release.yaml`.

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

Important:

- pushing the `release` branch alone does not publish artifacts
- pushing a tag alone does not publish artifacts
- the workflow runs when the GitHub Release is published for that tag

## Version Semantics

- MV2 (`develop`):
  - local build version source: `package.json`
  - release workflow rewrites `package.json` version to match the release tag
- MV3 (`mv3-fr`):
  - build version source: `VERSION` env var in Vite config
  - fallback source if `VERSION` missing: `src/manifest.json`

Implication: tag value on `release` is the single source of truth for published artifact versions.

## Feature Delivery Flow (Mandatory)

1. If HyperChat changes are involved, finish the HyperChat ladder first (`mv2` -> `mv3` -> `mv3-ltl`).
2. Implement and validate on `develop`.
3. Commit and push `develop`.
4. Merge `develop` into `mv3-fr`.
5. Adapt for MV3 differences, validate, commit, and push `mv3-fr`.
6. Update `release` branch submodule pointers to those exact commits.
7. Commit and push `release`.
8. Create/push tag (for example `v9.0.10`) on `release`.
9. Publish GitHub release for that tag.

## Release Commit Style

- `release` commits should usually be pure checkpoint bumps and nothing else.
- Prefer short, boring subjects:
  - `bump both`
- Do not stuff version notes, changelog prose, or implementation explanation into the `release` commit subject.
- Put user-facing release notes in the GitHub Release body, not in the packaging-branch commit.
- If a `release` commit touches files other than the two packaging submodules, stop and re-check whether the work belongs on `develop`/`mv3-fr` instead.

## Updating the `release` Branch Pointers

Prefer a separate worktree so you do not dirty the main implementation checkout:

```bash
git fetch origin
git worktree add -B release /tmp/livetl-release origin/release
cd /tmp/livetl-release
git submodule update --init --recursive

cd firefox-mv2
git fetch origin
git checkout <develop_commit_sha>
git submodule update --init --recursive
cd ..

cd chrome-mv3
git fetch origin
git checkout <mv3_fr_commit_sha>
git submodule update --init --recursive
cd ..

git add firefox-mv2 chrome-mv3
git commit -m "bump both"
git push origin release
```

Then tag/publish:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

Publish the GitHub release for `vX.Y.Z` to trigger upload automation.

Useful verification after the bump:

```bash
git ls-tree HEAD chrome-mv3 firefox-mv2
git -C firefox-mv2 rev-parse --short HEAD
git -C chrome-mv3 rev-parse --short HEAD
```

If the nested `src/submodules/chat` submodule shows as modified after switching the packaging submodules, normalize it with `git submodule update --init --recursive` inside that packaging submodule before committing.

## Local Pre-Release Verification

Before updating `release`:

- On `develop` commit:
  - `sudo yarn`
  - `sudo yarn build:production`
  - `sudo yarn package`
- On `mv3-fr` commit:
  - `sudo yarn`
  - `sudo env PATH="$PWD/node_modules/.bin:$PATH" yarn build:chrome`
  - `sudo yarn package`

For MV3 runtime sanity in this shell, functional browser validation is more reliable with Chromium hidden mode (`headless=false` plus `--ozone-platform=headless`) than with plain `--headless=new`.

Quick zip sanity check:

```bash
unzip -p dist/LiveTL-Chrome.zip manifest.json | jq '.manifest_version, .version'
unzip -p dist/LiveTL-Firefox.zip manifest.json | jq '.manifest_version, .version'
```

## Common Failure Modes

- Wrong branch order:
  - starting in LiveTL before the matching HyperChat change exists causes avoidable rework and stale submodule pointers.
  - fixing only `mv3-fr` first causes divergence from MV2 source branch.
- Stale submodule state:
  - forgetting `git submodule update --init --recursive` after branch switch.
- Incorrect release branch:
  - tagging `develop` or `mv3-fr` directly bypasses the dual-submodule publish pipeline.
- Stale local `release` branch:
  - operating on an old local `release` checkout instead of `origin/release`.
- Nested submodule drift:
  - bumping `firefox-mv2` or `chrome-mv3` without normalizing their own `src/submodules/chat` checkout.
- Version mismatch:
  - expecting `mv3-fr/src/manifest.json` alone to control release version in CI.
