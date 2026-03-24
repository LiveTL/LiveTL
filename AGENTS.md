# LiveTL Codex Workflow

## Scope

- This repo builds the LiveTL browser extension and vendors HyperChat as a submodule at `src/submodules/chat`.
- Keep HyperChat implementation details in HyperChat docs. Do not duplicate full HyperChat internals here.
- For chat internals and architecture, start with `src/submodules/chat/README.md` and then inspect upstream HyperChat branches directly.

## Branch Discipline (Mandatory)

- `develop` is the MV2 source-of-truth branch for feature work.
- `mv3-fr` is the MV3 port branch.
- `release` is a packaging branch that points to two LiveTL submodules (`firefox-mv2` and `chrome-mv3`).
- Always implement on `develop` first, then carry the change to `mv3-fr`.
- Never do feature/fix implementation directly on `release`.

## House Style

- Commit subjects should be short, direct, and easy to scan in `git log --oneline`.
- Prefer active voice and plain wording:
  - `bump hc mv2`
  - `agent upkeep`
  - `bump both`
- Avoid padded scopes, issue-number prefixes, and long explanatory subjects.
- A mildly funny subject is acceptable if it is still clear immediately.
- Prefer proper merges when carrying `develop` into `mv3-fr`.
- If `mv3-fr` needs extra adaptation after the merge, keep it as a small follow-up commit rather than hand-copying a separate implementation.

## Code Patterns

- Treat `develop` as the source branch for shared behavior.
- Keep `mv3-fr` focused on MV3-specific adaptation:
  - manifest differences
  - background/runtime differences
  - build tooling differences
- Do not duplicate HyperChat internals in LiveTL when the right fix belongs upstream in the submodule.
- If a bug spans HyperChat and LiveTL, land the shared chat-side fix in HyperChat first, then bump the submodule in LiveTL.
- Prefer editing existing modules and utilities over creating tiny one-off files.
- Keep repo boundaries clean:
  - LiveTL owns LiveTL UI, player wiring, translation aggregation, packaging
  - HyperChat owns chat parsing, chat rendering, chat actions, and chat-side runtime behavior
- When fixing cross-branch issues, prefer one shared implementation on `develop` plus a narrow MV3 adaptation, not two divergent fixes.

## HyperChat Submodule Mapping

- `develop` should pin `src/submodules/chat` to a HyperChat commit from the MV2 line.
- `mv3-fr` should pin `src/submodules/chat` to a HyperChat commit from `mv3-ltl`.
- `release` should pin:
  - `firefox-mv2` to a LiveTL commit on `develop`
  - `chrome-mv3` to a LiveTL commit on `mv3-fr`
- After branch switches, run:
  - `git submodule update --init --recursive`
- If the submodule appears dirty after a branch switch, treat it as a sync issue first, not as a code change.

## Sync Ladder (Mandatory)

- When syncing HyperChat into LiveTL, follow this order:
  1. HyperChat `mv2`
  2. HyperChat `mv3` (merge/adapt from `mv2`)
  3. HyperChat `mv3-ltl` (merge/adapt from `mv3`)
  4. LiveTL `develop` bumping `src/submodules/chat` to HyperChat `mv2`
  5. LiveTL `mv3-fr` merging `develop` and pinning `src/submodules/chat` to HyperChat `mv3-ltl`
  6. LiveTL `release` bumping `firefox-mv2` to `develop` and `chrome-mv3` to `mv3-fr`
- Do not skip layers in that ladder.
- In practice, the expected commit relationships are:
  - `develop:src/submodules/chat` == HyperChat `origin/mv2`
  - `mv3-fr:src/submodules/chat` == HyperChat `origin/mv3-ltl`
  - `release:firefox-mv2` == LiveTL `origin/develop`
  - `release:chrome-mv3` == LiveTL `origin/mv3-fr`
- Useful verification commands:
  - `git ls-tree develop src/submodules/chat`
  - `git ls-tree mv3-fr src/submodules/chat`
  - `git ls-tree release chrome-mv3 firefox-mv2`

## Branch Switch Hygiene

- Use `yarn` (not npm) in this repo.
- Reinstall dependencies after branch switches:
  - `sudo yarn`
- Build systems differ by branch (`webpack` on `develop`, `vite` on `mv3-fr`), so stale build artifacts are common if you skip reinstall/rebuild.
- `release` is easiest to handle in a separate worktree:
  - `git worktree add -B release /tmp/livetl-release origin/release`
- If branch switching leaves untracked MV3 build artifacts behind, remove only the generated files and normalize submodules before continuing.

## Build and Test Matrix

### `develop` (MV2, webpack)

- Build: `sudo yarn build:production`
- Package zips: `sudo yarn package`
- Unit tests: `sudo yarn test`
- E2E tests: `sudo yarn e2e` (heavier, requires browser deps)
- Runtime note:
  - MV2 runtime validation is reliable in Firefox.
  - Modern Chromium in this environment (Chrome/Chromium 146) does not reliably load/run LiveTL MV2 extension targets.

### `mv3-fr` (MV3, vite)

- Build Chrome: `sudo yarn build:chrome`
- Build Firefox: `sudo yarn build:firefox`
- Watch builds:
  - `sudo yarn dev:chrome`
  - `sudo yarn dev:firefox`
- Unit tests: `sudo yarn test`
- E2E tests: `sudo yarn e2e`

## Chromium Validation (MV3, Tested)

Validated on 2026-03-23 with `/snap/bin/chromium`.

### Smoke Load (`--headless=new`)

1. Build MV3 bundle:
   - `sudo env PATH="$PWD/node_modules/.bin:$PATH" yarn build:chrome`
2. Launch Chromium:
   - `chromium --headless=new --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --remote-debugging-port=9222 --user-data-dir=/tmp/livetl-mv3-profile --disable-extensions-except=$PWD/build --load-extension=$PWD/build https://www.youtube.com/watch?v=jfKfPfyJRdk`
3. Verify extension load via DevTools target list:
   - `curl -s http://127.0.0.1:9222/json/list | jq '[.[] | {type, url, title}]'`
4. Expected signal:
   - LiveTL `service_worker` target at `chrome-extension://.../js/pages/background.js`
   - often also a `welcome.html` extension page
5. Limitation:
   - in this environment, `--headless=new` is good for extension-load smoke checks but is not reliable proof that LiveTL chat injection actually works.

### Functional MV3 Browser Validation

- For real runtime checks in this environment, prefer Chromium automation with:
  - `headless=false`
  - `--ozone-platform=headless`
  - extension args: `--disable-extensions-except=<build>` and `--load-extension=<build>`
- This hidden-browser mode is the reliable path for checking:
  - LiveTL button injection in the YouTube chat frame
  - HyperChat mount/cleanup behavior
  - `Embed TLs` opening correctly
- Treat a passing `--headless=new` run as necessary but not sufficient.

## Testbed URL Guidance

- `mv3-fr` Vite config sets:
  - `https://www.youtube.com/watch?v=jfKfPfyJRdk`
- Use that as default browser testbed unless reproducing an issue that needs a specific stream/chat URL.
- For archive/VOD checks, do not assume failures are regressions without a baseline; that path has historically been less stable in hidden-browser automation.

## Release Process and Versioning

- Full release choreography lives in `AGENT_RELEASE.md`.
- Version source differs by branch:
  - `develop` (MV2): version comes from `package.json` at build time.
  - `mv3-fr` (MV3): version comes from `VERSION` env var in CI (fallback is `src/manifest.json`).
