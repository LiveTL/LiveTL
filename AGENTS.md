# LiveTL Development Workflow

## Branch discipline

- `mv3-fr` is the default and only maintained implementation branch. Start all
  new LiveTL work there and target it with pull requests.
- `develop` is retained for history and existing pull requests, but receives no
  new implementation work.
- `release` is a legacy rollback branch, not a development or packaging branch.
- MV2 and MV3 are build targets from the same source, not separate source
  branches. Do not restore the old `develop -> mv3-fr -> release` sync ladder.

If a change belongs in HyperChat, land it on HyperChat `main` first, then update
the single `src/submodules/chat` gitlink on LiveTL `mv3-fr`. All LiveTL targets
must use that same HyperChat commit.

After cloning or changing commits, normalize the submodule before diagnosing it
as dirty:

```bash
git submodule update --init --recursive
```

## Build and test

Use Yarn, not npm. The supported targets are:

| Target | Build | Watch | Output |
| --- | --- | --- | --- |
| Chrome MV3 | `yarn build:chrome` | `yarn dev:chrome` | `build/chrome` |
| Firefox MV3 | `yarn build:firefox` | `yarn dev:firefox` | `build/firefox` |
| Firefox MV2 | `yarn build:mv2` | `yarn dev:mv2` | `build/mv2` |

`VERSION=0.0.0 yarn build` typechecks, builds, and verifies all three targets.
`yarn package` creates the published Chrome MV3 and Firefox MV2 ZIPs in `dist`.
Firefox MV3 remains a validation target and is not packaged for release.

Before handing off a change, run:

```bash
yarn format:check
yarn test
VERSION=0.0.0 yarn build
yarn package
```

The Chromium functional smoke test defaults to `build/chrome`:

```bash
bash scripts/codex-dev.sh go-test
```

## Code ownership and style

- LiveTL owns its UI, player wiring, translation aggregation, browser-specific
  manifest/runtime seams, packaging, and release automation.
- HyperChat owns chat parsing, rendering, actions, and shared chat behavior. Do
  not duplicate HyperChat internals in LiveTL when the fix belongs upstream.
- Keep MV-specific behavior at the manifest or `__MV__` seam; do not fork
  general feature modules by manifest version.
- Keep commit subjects short, direct, and easy to scan.

## Release source

Release tags are created on `mv3-fr`. The tag version is supplied to every
target through `VERSION`, and the workflow uploads only
`LiveTL-Chrome.zip` and `LiveTL-Firefox.zip`. See `AGENT_RELEASE.md` for the
release and rollback procedure.
