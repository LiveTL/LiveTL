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

## HyperChat Submodule Mapping

- `develop` should pin `src/submodules/chat` to a HyperChat commit from the MV2 line.
- `mv3-fr` should pin `src/submodules/chat` to a HyperChat commit from `mv3-ltl`.
- After branch switches, run:
  - `git submodule update --init --recursive`
- If the submodule appears dirty after a branch switch, treat it as a sync issue first, not as a code change.

## Branch Switch Hygiene

- Use `yarn` (not npm) in this repo.
- Reinstall dependencies after branch switches:
  - `sudo yarn`
- Build systems differ by branch (`webpack` on `develop`, `vite` on `mv3-fr`), so stale build artifacts are common if you skip reinstall/rebuild.

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

## Headless Chromium Validation (MV3, Tested)

Validated on 2026-03-23 with `/snap/bin/chromium`.

1. Build MV3 bundle:
   - `sudo yarn build:chrome`
2. Launch headless Chromium with the unpacked extension:
   - `chromium --headless=new --no-sandbox --disable-setuid-sandbox --remote-debugging-port=9222 --user-data-dir=/tmp/livetl-mv3-profile --disable-extensions-except=$PWD/build --load-extension=$PWD/build https://www.youtube.com/watch?v=jfKfPfyJRdk`
3. Verify extension load via DevTools target list:
   - `curl -s http://127.0.0.1:9222/json/list | jq '[.[] | {type, url, title}]'`
   - Expected signal: a `service_worker` target at `chrome-extension://.../js/pages/background.js`.
4. Stop Chromium with `Ctrl-C`.

## Testbed URL Guidance

- `mv3-fr` Vite config sets:
  - `https://www.youtube.com/watch?v=jfKfPfyJRdk`
- Use that as default browser testbed unless reproducing an issue that needs a specific stream/chat URL.

## Release Process and Versioning

- Full release choreography lives in `AGENT_RELEASE.md`.
- Version source differs by branch:
  - `develop` (MV2): version comes from `package.json` at build time.
  - `mv3-fr` (MV3): version comes from `VERSION` env var in CI (fallback is `src/manifest.json`).
