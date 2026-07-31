# HyperChat Codex Workflow (MV3 Main)

## Branch Discipline

- Make code changes on `mv2` first.
- `main` is the real MV3 branch.
- `mv3` and `mv3-ltl` are retired. Do not use them as MV3 source branches for new work or cross-repo sync; `main` is the MV3 line LiveTL consumes.
- Do not implement feature/fix work directly on `main`.
- If a task starts on another branch, switch to `mv2` before editing unless the user explicitly asks otherwise.
- If a task touches both HyperChat and LiveTL, HyperChat still goes first.
- Cross-repo order is mandatory:
  1. HyperChat `mv2`
  2. HyperChat `main`
  3. LiveTL `develop`
  4. LiveTL `mv3-fr`
  5. LiveTL `release`
- Never start cross-repo work in LiveTL when the HyperChat submodule also needs to change.
- If the task also requires syncing YtcFilter (YTCF), do it after HyperChat `main` is updated:
  - merge HyperChat `main` into YTCF `master`
  - keep YTCF release notes and its in-product changelog in the strict one-line, lowercase, user-facing style documented in YTCF's `AGENTS.md`

## House Style

- Commit messages should be short, direct, and readable in `git log --oneline`.
- Prefer active voice and concrete verbs:
  - `hide @ in names`
  - `fix lingering yt visuals`
  - `order matters`
- Avoid padded scopes, issue-number prefixes, and changelog-style essays in commit subjects.
- A slightly dry or funny commit is fine if it is still clear at a glance.
- Prefer proper merges when carrying `mv2` work into `main`.
- If MV3 needs follow-up adaptation, keep that as a small, explicit commit after the merge instead of rewriting history or hand-copying changes.

## Code Patterns

- Prefer editing existing modules and utilities over creating one-off files for tiny helpers.
- If a helper obviously belongs in an existing shared utility file, put it there.
- Put shared behavior on `mv2` first; `main` should usually be a merge-plus-adaptation branch, not a separate feature branch.
- Keep MV3 adaptation narrow:
  - preserve branch-specific build/runtime wiring
  - change only what is required for manifest/background/injection differences
- Prefer render-edge formatting over mutating raw identity data:
  - keep parsed message/channel ids untouched
  - transform display text at component or view-model boundaries
- Prefer resilient lookups over brittle positions:
  - endpoint/type detection over fixed menu indices
  - semantic selectors/utilities over DOM-order assumptions
- When a bug appears in multiple surfaces, prefer fixing the shared parser/messaging/util layer before patching several components by hand.

## Changelog Style

- Keep release bullets short and user-facing.
- Prefer active voice:
  - `Fix admin block/report actions`
  - `Hide leading @ in names`
- Avoid passive voice, filler, and overly technical internal wording unless the release note is specifically for maintainers.

## Codex Dev Runtime

- Run `scripts/codex-dev.sh setup-mcp` once (or per fresh machine) to register the Codex MCP server:
  - name: `chrome-devtools`
  - command: `npx -y chrome-devtools-mcp@latest --browserUrl=http://127.0.0.1:9222`
- Use `scripts/codex-dev.sh watch` once per session to keep Chrome extension builds live in the background.
- On `main`, this resolves to MV3 scripts (`dev:chrome`/`build:chrome`) and `build/chrome` output automatically.
- On `mv2`, watcher mode prefers `npm run start:none` so build watch stays alive without separate browser autolaunch.
- Start headless browser testing only when explicitly requested (for example: "go test", "test this", "run browser test").
- For test runs, use `scripts/codex-dev.sh go-test`. This guarantees:
  - MCP configuration is present
  - watcher is running
  - headless Chromium is restarted with a fresh profile and extension reload
- If Chromium fails to start in a sandboxed/snap environment, set `CHROME_BIN` to a non-snap Chrome/Chromium binary before `go-test`.

## Reload Policy

- After significant extension-runtime changes, run `scripts/codex-dev.sh reload` before validation.
- Treat these as significant by default:
  - `src/scripts/**`
  - `src/components/**`
  - `src/manifest.json`
  - `vite.config.ts`
  - settings/storage/messaging code under `src/ts/**`
- The reload is intentionally hard (full browser restart) to avoid stale MV3 service-worker state, extension cache artifacts, and mixed-profile debugging drift.

## UI Name Formatting

- For chat author display, hide a leading `@` in UI text while keeping underlying identity data unchanged.
- Use `src/ts/component-utils.ts` (`formatAuthorName`) for this transformation and apply it at render points.

## Emoji Placeholder Handling

- Treat legacy member emoji placeholders (`U+25A1`, rendered as `□`) as emoji-equivalent for filtering.
- In `HIDE_ALL` mode, do not render these placeholders in `MessageRuns.svelte`.
- For emoji-only spam detection, count placeholder-only text runs as emoji in `isAllEmoji`.

## Block/Report Endpoint Handling

- Do not assume fixed menu item indices from `get_item_context_menu` (YouTube may reorder menu items).
- Resolve block/report actions by searching for endpoint types (`moderateLiveChatEndpoint`, `getReportFormEndpoint`) in the response tree.
- Always post `chatUserActionResponse` even when message context params are missing so UI state can fail gracefully.
- Keep proxy fetch request/response events correlated by request id; do not use unscoped global listeners.

## YouTube Actions (Dev Notes)

- For deeper notes on implementing new YouTube chat actions (headers, tracking params, endpoint discovery, SAPISIDHASH, and debugging), see `docs/YOUTUBE_ACTIONS.md`.

## Testbed URL

- Headless validation should open the same `startUrl` used by `vite.config.ts`.
- `scripts/codex-dev.sh go-test` does this automatically (defaulting by detected mode), and `TEST_URL` can override when needed.

## Cross-Browser Headless Validation Notes

- Always rebuild for the target browser before runtime validation:
  - `yarn build:chrome`
  - `yarn build:firefox`
- Chromium extension validation is most reliable in CI/headless shells with:
  - Playwright Chromium persistent context
  - `headless=false` plus `--ozone-platform=headless`
  - extension args: `--disable-extensions-except=<build>` and `--load-extension=<build>`
- Firefox validation in this environment must set `HOME=/root` before launching browser automation as root, or Firefox exits early with a root/session ownership error.
- For Firefox runtime checks, prefer `https://www.youtube.com/live_chat?is_popout=1&v=X4VbdwhkE10&continuation=0ofMyAOAARpeQ2lrcUp3b1lWVU5UU2pSbmExWkROazV5ZGtsSk9IVnRlblJtTUU5M0VndFlORlppWkhkb2EwVXhNQm9UNnFqZHVRRU5DZ3RZTkZaaVpIZG9hMFV4TUNBQk1BQSUzRDABggEICAQYAiAAKACIAQGgAfr808_a-JQDqAEAsgEA` for deterministic chat-frame loading in headless mode.
- Packaged LiveTL Firefox translation is a special case: keep the request bridge in HC, but host the actual translator iframe on the YouTube page side.
- For LiveTL MV2 (webpack), `iframe-translator`'s `getClient()` is safe to use as long as the bundler rewrites `import.meta.env.DEV` to `false` for `node_modules/iframe-translator/index.js` (otherwise `import.meta.env` can be undefined at runtime).

## Embed 404 Notes (MV3)

- The MV3 embed fallback page (`/embed/hyperchat_embed`) can render a centered YouTube logo/error artifact if page elements are not fully removed.
- In `src/scripts/chat-mounter.ts`, treat the HyperChat mount root as the only allowed direct `body` child and aggressively remove fallback embed artifacts, including `#player-controls`.
- If the logo reappears in browser tests, prioritize checking `chat-mounter.ts` cleanup selectors and page timing behavior before touching parser/UI code.

## Operational Commands

- `scripts/codex-dev.sh status` shows watcher/MCP/browser states.
- `scripts/codex-dev.sh logs` prints watcher/browser log file locations.
- `scripts/codex-dev.sh stop` shuts down watcher and the headless browser.
