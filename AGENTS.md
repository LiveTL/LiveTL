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
npm run package
```

Runtime notes:

- Firefox MV2 is the reliable runtime-validation target for MV2 behavior.
- Modern Chromium does not reliably load or run LiveTL's MV2 target.
- Firefox MV3 can be build- and runtime-validated, but cannot replace the MV2
  release while LiveTL depends on blocking response-header rewriting.

## Chromium Validation (MV3, Tested)

The Chromium functional smoke test defaults to `build/chrome`:

```bash
bash scripts/codex-dev.sh go-test
```

### Smoke Load (`--headless=new`)

1. Build the Chrome MV3 bundle:

   ```bash
   VERSION=0.0.0 npm run build:chrome
   ```

2. Launch Chromium with only LiveTL enabled:

   ```bash
   chromium --headless=new --no-sandbox --disable-setuid-sandbox \
     --disable-dev-shm-usage --remote-debugging-port=9222 \
     --user-data-dir=/tmp/livetl-mv3-profile \
     --disable-extensions-except="$PWD/build/chrome" \
     --load-extension="$PWD/build/chrome" \
     https://www.youtube.com/watch?v=X4VbdwhkE10
   ```

3. Inspect the DevTools target list:

   ```bash
   curl -s http://127.0.0.1:9222/json/list | jq '[.[] | {type, url, title}]'
   ```

4. Expect a LiveTL `service_worker` target at
   `chrome-extension://.../js/pages/background.js`, and often a `welcome.html`
   extension page.

This proves that Chromium loaded the extension, not that YouTube chat content
scripts mounted.

### Functional MV3 Browser Validation

The repo harness uses `xvfb-run`, Playwright, a fresh non-headless Chromium
profile, the unpacked `build/chrome` extension, and seeded extension storage so
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
bash scripts/codex-dev.sh watch
bash scripts/codex-dev.sh go-test
bash scripts/codex-dev.sh status
KEEP_OPEN=1 bash scripts/codex-dev.sh go-test
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
- Release tags are created on `main`.
- The tag version is supplied to every target through `VERSION`; local builds
  fall back to `src/manifest.json`.
- Release automation uploads only `LiveTL-Chrome.zip` and
  `LiveTL-Firefox.zip`.
