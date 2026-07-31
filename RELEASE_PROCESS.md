# HyperChat Release Process

This repo ships from two active lines that serve different purposes.

## Branch Order

1. Make and validate changes on `mv2` first.
2. Commit and push on `mv2`.
3. Merge `mv2` into `main`.
4. Validate and push `main`.
5. Create releases from each branch that actually ships.

`main` is the MV3 line LiveTL consumes. `mv3` and `mv3-ltl` are historical. Do not route normal maintenance through them unless the user explicitly asks for branch archaeology.

If the same task also affects LiveTL, do not begin in LiveTL. Finish this HyperChat ladder first, then bump the LiveTL submodule chain in this order:

1. LiveTL `develop`
2. LiveTL `mv3-fr`
3. LiveTL `release`

HyperChat is the upstream source for shared chat behavior. LiveTL is downstream packaging/integration work after that.

## Local Validation

On `mv2`:

```bash
git checkout mv2
yarn
yarn build
yarn package
```

On `main`:

```bash
git checkout main
yarn
yarn build:chrome
yarn build:firefox
```

Reinstall after switching branches. Dependency trees and lockfiles differ enough that stale installs can break builds.

## Release Behavior By Branch

### `mv2`

- Workflow: `.github/workflows/release.yml`
- Trigger: GitHub release event `released`
- Build command uses inline env injection: `VERSION=<tag> yarn build`
- Result: release tag version is injected into the built manifest at build time.

Practical rule for `mv2`: create a release tag like `v69.43.0` and the workflow builds that version.

### `main`

- Workflow: `.github/workflows/release.yml`
- Trigger: GitHub release event `published`
- Build version comes from `package.json`, and Vite writes it into the manifest at build time.

Practical rule for `main`: bump `package.json`, commit it, then create/publish the release tag.

## Recommended "Least Surprise" Publish Flow

1. Finish feature/fix on `mv2`, run local build/package checks, push.
2. Merge to `main`, run local build checks, push.
3. Create `mv2` release tag and publish release.
4. Bump version state on `main`, then create/publish the `main` release tag.
5. Confirm both artifacts exist on each GitHub release:
   - `HyperChat-Chrome.zip`
   - `HyperChat-Firefox.zip`

## Notes For LiveTL Sync

LiveTL consumes HyperChat via submodules. Keep HyperChat changes branch-aligned across `mv2` and `main` so LiveTL can take them with straightforward submodule bumps in its release flow. LiveTL's MV2 Firefox variant tracks `mv2`; its MV3 line tracks `main`.
