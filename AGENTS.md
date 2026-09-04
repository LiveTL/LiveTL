# LiveTL Codex Workflow

## Scope

- This npm workspace builds LiveTL from `apps/LiveTL`, standalone HyperChat
  from `apps/HyperChat`, and YtcFilter from `apps/YtcFilter`.
- LiveTL bundles the shared HyperChat source directly from `apps/HyperChat`.
- YtcFilter carries an adapted chat runtime in its own workspace. When shared
  HyperChat runtime behavior changes and applies to YtcFilter, port or merge it
  into `apps/YtcFilter` explicitly.
- Keep HyperChat implementation details in HyperChat docs. Do not duplicate
  full HyperChat internals here.
- For chat internals and architecture, start with `apps/HyperChat/README.md` and
  `apps/HyperChat/AGENTS.md`.
- For YtcFilter-specific behavior, start with `apps/YtcFilter/README.md` and
  `apps/YtcFilter/AGENTS.md`.

## Branch Discipline (Mandatory)

- `main` is the default and only maintained implementation branch. Start all
  new LiveTL work there and target it with pull requests.
- `develop` is retained for history and existing pull requests, but receives no
  new implementation work.
- `release` is a legacy rollback branch, not a development or packaging branch.
- MV2 and MV3 are build targets from the same source, not separate source
  branches. Do not restore the old `develop -> mv3-fr -> release` sync ladder.
- Changes under `apps/HyperChat` affect both standalone HyperChat and LiveTL.
  If the same runtime change applies to YtcFilter, port or merge it before
  release. Verify every affected application before merging to `main`.

## House Style

- Commit subjects should be short, direct, and easy to scan in
  `git log --oneline`.
- Prefer active voice and plain wording:
  - `bump hc`
  - `agent upkeep`
  - `bump both`
- Avoid padded scopes, issue-number prefixes, and long explanatory subjects.
- A mildly funny subject is acceptable if it is still clear immediately.
- Keep machine-specific paths, hostnames, profile directories, and private debug
  aliases out of committed docs.

## Code Patterns

- Do not duplicate HyperChat internals in LiveTL when the right fix belongs in
  the shared `apps/HyperChat` source.
- Packaged HyperChat translation on Firefox is a split-boundary case: HyperChat
  owns the request/response bridge, while LiveTL owns the bundling entry that
  injects the page-side translator host.
- Prefer editing existing modules and utilities over creating tiny one-off
  files.
- Keep repo boundaries clean:
  - LiveTL owns its UI, player wiring, translation aggregation,
    browser-specific manifest/runtime seams, packaging, and release automation.
  - HyperChat owns chat parsing, rendering, actions, and shared chat behavior.
  - YtcFilter owns filters, presets, triggers, archives, setup, settings, and
    its adapted filtered-chat runtime.
- Keep MV-specific behavior at the manifest or numeric `__MV__` seam; do not
  fork general feature modules by manifest version.
- Firefox MV3 cannot perform LiveTL's blocking response-header rewrite to strip
  YouTube CSP and `X-Frame-Options`. Firefox MV2 therefore remains the published
  Firefox target; Firefox MV3 is validation-only until that requirement changes.

## HyperChat Workspace Mapping

- LiveTL imports HyperChat through the `@hyperchat` alias and small build entry
  modules under `apps/LiveTL/src/hyperchat`.
- `__LIVETL__` is `true` for LiveTL bundles and `false` for standalone
  HyperChat bundles. Keep all other shared behavior in `apps/HyperChat`.

## YtcFilter Workspace Mapping

- YtcFilter builds from `apps/YtcFilter`; it does not import HyperChat at build
  time.
- Preserve HyperChat ancestry when carrying shared runtime fixes into YtcFilter,
  but resolve conflicts as an adapted YtcFilter port.

## Branch Switch Hygiene

- Use npm in this repo.
- Reinstall dependencies after a branch or lockfile change:

  ```bash
  npm ci
  ```

- Use a separate worktree for legacy-branch checks or parallel work. Do not
  disturb an existing dirty checkout.
- If switching leaves untracked build artifacts behind, remove only generated
  files before continuing.

## Build and Test Matrix

Root build, check, test, lint, and type-check commands are orchestrated by
Turborepo. Keep the implementation commands in each workspace independently
runnable and declare new generated outputs and output-affecting environment
variables in `turbo.json`. Local cache data lives in ignored `.turbo`
directories; remote caching is not configured.

The root LiveTL shortcuts build these targets:

| Target      | Build                   | Watch                 | Output                      | Release status  |
| ----------- | ----------------------- | --------------------- | --------------------------- | --------------- |
| Chrome MV3  | `npm run build:chrome`  | `npm run dev:chrome`  | `apps/LiveTL/build/chrome`  | Published       |
| Firefox MV3 | `npm run build:firefox` | `npm run dev:firefox` | `apps/LiveTL/build/firefox` | Validation-only |
| Firefox MV2 | `npm run build:mv2`     | `npm run dev:mv2`     | `apps/LiveTL/build/mv2`     | Published       |

Extension-specific root build aliases:

| Extension | Command                   | Published archives                              |
| --------- | ------------------------- | ----------------------------------------------- |
| LiveTL    | `npm run build:livetl`    | `LiveTL-Chrome.zip`, `LiveTL-Firefox-mv2.zip`   |
| HyperChat | `npm run build:hyperchat` | `HyperChat-Chrome.zip`, `HyperChat-Firefox.zip` |
| YtcFilter | `npm run build:ytcfilter` | `YtcFilter-Chrome.zip`, `YtcFilter-Firefox.zip` |

`VERSION=0.0.0 npm run build` typechecks, builds, verifies, and packages all
targets. The published archives are created in the application build directories.

Before handing off a change, run:

```bash
npm run format:check
npm run lint:check
npm run test
VERSION=0.0.0 npm run build
```

Runtime notes:

- Firefox MV2 is the reliable runtime-validation target for MV2 behavior.
- Modern Chromium does not reliably load or run LiveTL's MV2 target.
- Firefox MV3 can be build- and runtime-validated, but cannot replace the MV2
  release while LiveTL depends on blocking response-header rewriting.

## Chromium Validation (MV3, Tested)

The Chromium functional smoke test defaults to `apps/LiveTL/build/chrome`:

```bash
bash apps/LiveTL/scripts/codex-dev.sh go-test
```

### Smoke Load (`--headless=new`)

1. Build the Chrome MV3 bundle:

   ```bash
   VERSION=0.0.0 npm run build:chrome
   ```

2. Launch Chromium with only LiveTL enabled:

   ```bash
   PROFILE_DIR="$(mktemp -d)"
   DEVTOOLS_PORT="${DEVTOOLS_PORT:-9222}"
   chromium --headless=new --no-sandbox --disable-setuid-sandbox \
     --disable-dev-shm-usage --remote-debugging-port="$DEVTOOLS_PORT" \
     --user-data-dir="$PROFILE_DIR" \
     --disable-extensions-except="$PWD/apps/LiveTL/build/chrome" \
     --load-extension="$PWD/apps/LiveTL/build/chrome" \
     https://www.youtube.com/watch?v=X4VbdwhkE10
   ```

3. Inspect the DevTools target list:

   ```bash
   curl -s "http://127.0.0.1:${DEVTOOLS_PORT}/json/list" | jq '[.[] | {type, url, title}]'
   ```

4. Expect a LiveTL `service_worker` target at
   `chrome-extension://.../js/pages/background.js`, and often a `welcome.html`
   extension page.

This proves that Chromium loaded the extension, not that YouTube chat content
scripts mounted.

### Functional MV3 Browser Validation

The repo harness uses `xvfb-run`, Playwright, a fresh non-headless Chromium
profile, the unpacked `apps/LiveTL/build/chrome` extension, and seeded extension storage so
HyperChat is enabled. It checks:

- LiveTL button injection in the YouTube chat frame
- HyperChat iframe mount inside the chat frame
- `.hyperchat-root` inside the embed frame
- removal of `www-player.css` and `link[name="www-player"]`
- removal of stray player shell nodes such as `#player-controls`

Install the browser wrapper dependencies once on a fresh Linux machine:

```bash
sudo apt-get install -y xvfb xauth
```

The smoke script exits nonzero if any required mount or cleanup check fails.
Useful entrypoints are:

```bash
bash apps/LiveTL/scripts/codex-dev.sh watch
bash apps/LiveTL/scripts/codex-dev.sh go-test
bash apps/LiveTL/scripts/codex-dev.sh status
KEEP_OPEN=1 bash apps/LiveTL/scripts/codex-dev.sh go-test
```

## Testbed URL Guidance

- Vite and the browser smoke harness default to
  `https://www.youtube.com/watch?v=X4VbdwhkE10`.
- Use that testbed unless reproducing an issue that needs a specific stream or
  chat URL.
- For archive/VOD checks, do not assume failures are regressions without a
  baseline; that path is less stable in hidden-browser automation.

## Release Process and Versioning

- Full release choreography lives in `AGENT_RELEASE.md`.
- GitHub Releases are published from tags on `main`.
- The tag version is supplied to every target through `VERSION`; local builds
  fall back to `src/manifest.json`.
- Release automation uploads the archives for the matching release tag:
  `LiveTL-Chrome.zip` and `LiveTL-Firefox-mv2.zip`,
  `HyperChat-Chrome.zip` and `HyperChat-Firefox.zip`, or
  `YtcFilter-Chrome.zip` and `YtcFilter-Firefox.zip`.
