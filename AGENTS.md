# LiveTL Codex Workflow

## Scope

- This repo builds the LiveTL browser extension and vendors HyperChat as a
  submodule at `src/submodules/chat`.
- Keep HyperChat implementation details in HyperChat docs. Do not duplicate
  full HyperChat internals here.
- For chat internals and architecture, start with
  `src/submodules/chat/README.md` and then inspect upstream HyperChat directly.

## Branch Discipline (Mandatory)

- `main` is the default and only maintained implementation branch. Start all
  new LiveTL work there and target it with pull requests.
- `develop` is retained for history and existing pull requests, but receives no
  new implementation work.
- `release` is a legacy rollback branch, not a development or packaging branch.
- MV2 and MV3 are build targets from the same source, not separate source
  branches. Do not restore the old `develop -> mv3-fr -> release` sync ladder.
- If a change belongs in HyperChat, land it on HyperChat `main` first, then
  update the single `src/submodules/chat` gitlink on LiveTL `main`.
- All LiveTL targets must use the same HyperChat commit.

## House Style

- Commit subjects should be short, direct, and easy to scan in
  `git log --oneline`.
- Prefer active voice and plain wording:
  - `bump hc`
  - `agent upkeep`
  - `bump both`
- Avoid padded scopes, issue-number prefixes, and long explanatory subjects.
- A mildly funny subject is acceptable if it is still clear immediately.

## Code Patterns

- Do not duplicate HyperChat internals in LiveTL when the right fix belongs
  upstream in the submodule.
- If a bug spans HyperChat and LiveTL, land the shared chat-side fix in
  HyperChat first, then bump the submodule in LiveTL.
- Packaged HyperChat translation on Firefox is a split-boundary case: HyperChat
  owns the request/response bridge, while LiveTL owns the bundling entry that
  injects the page-side translator host.
- Prefer editing existing modules and utilities over creating tiny one-off
  files.
- Keep repo boundaries clean:
  - LiveTL owns its UI, player wiring, translation aggregation,
    browser-specific manifest/runtime seams, packaging, and release automation.
  - HyperChat owns chat parsing, rendering, actions, and shared chat behavior.
- Keep MV-specific behavior at the manifest or numeric `__MV__` seam; do not
  fork general feature modules by manifest version.
- Firefox MV3 cannot perform LiveTL's blocking response-header rewrite to strip
  YouTube CSP and `X-Frame-Options`. Firefox MV2 therefore remains the published
  Firefox target; Firefox MV3 is validation-only until that requirement changes.

## HyperChat Submodule Mapping

- LiveTL `main` pins one validated HyperChat `main` commit for every build
  target.
- After cloning or changing commits, run:

  ```bash
  git submodule update --init --recursive
  ```

- If the submodule appears dirty after a branch switch, treat it as a sync issue
  first, not as a code change.

## Branch Switch Hygiene

- Use npm in this repo.
- Reinstall dependencies after a branch or lockfile change:

  ```bash
  npm ci
  ```

- Use a separate worktree for legacy-branch checks or parallel work. Do not
  disturb an existing dirty checkout.
- If switching leaves untracked build artifacts behind, remove only generated
  files and normalize submodules before continuing.

## Build and Test Matrix

| Target | Build | Watch | Output | Release status |
| --- | --- | --- | --- | --- |
| Chrome MV3 | `npm run build:chrome` | `npm run dev:chrome` | `build/chrome` | Published |
| Firefox MV3 | `npm run build:firefox` | `npm run dev:firefox` | `build/firefox` | Validation-only |
| Firefox MV2 | `npm run build:mv2` | `npm run dev:mv2` | `build/mv2` | Published |

`VERSION=0.0.0 npm run build` typechecks, builds, and verifies all three targets.
`npm run package` creates the published Chrome MV3 and Firefox MV2 ZIPs in `dist`.

Before handing off a change, run:

```bash
npm run format:check
npm run test
VERSION=0.0.0 npm run build
npm run test:e2e
npm run package
```

Runtime notes:

- Firefox MV2 is the reliable runtime-validation target for MV2 behavior.
- Modern Chromium does not reliably load or run LiveTL's MV2 target.
- Firefox MV3 can be build- and runtime-validated, but cannot replace the MV2
  release while LiveTL depends on blocking response-header rewriting.

## Playwright Browser Tests

Install the managed browsers after `npm ci`:

```bash
npx playwright install chromium firefox
```

- `npm run test:e2e` tests existing builds with local, intercepted fixtures.
- `npm run test:e2e:live` runs the manual `@live` suite against an existing
  Chrome MV3 build.
- `npm run test:e2e:ui` opens Playwright UI mode for existing builds.
- `npm run e2e` builds all targets and runs the deterministic suite.
- `npm run e2e:live` builds Chrome MV3 and runs the manual `@live` suite against
  YouTube.

The `chromium-mv3` project loads `build/chrome` in a fresh persistent Chromium
context and covers LiveTL/HyperChat injection, embed mounting and cleanup,
opening LiveTL, and resize persistence. The `firefox-mv2-bridge` project tests
the packaged MV2 translation-host bundle in Firefox. Playwright does not load
the Firefox extension itself.

Deterministic tests must fulfill or block every external request. Real YouTube,
VOD translation, and scrolling checks belong in the manual `@live` suite and
must not gate pull requests, `main`, or releases. Use
`https://www.youtube.com/watch?v=X4VbdwhkE10` for the current live smoke unless
an issue requires another URL.

## Release Process and Versioning

- Full release choreography lives in `AGENT_RELEASE.md`.
- Release tags are created on `main`.
- The tag version is supplied to every target through `VERSION`; local builds
  fall back to `src/manifest.json`.
- Release automation uploads only `LiveTL-Chrome.zip` and
  `LiveTL-Firefox.zip`.
