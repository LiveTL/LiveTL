# HyperChat Codex Workflow

Paths and commands in this file are relative to `apps/HyperChat` unless noted otherwise.

## Branch Discipline

- `main` is the only maintained source branch. Make code changes there.
- `mv3`, `mv3-ltl`, and `mv2` are retired. Do not use them for new work.
- There is no branch ladder any more. MV2 and MV3 are **build targets on `main`**, not branches — see "Manifest Version Targets" below.
- HyperChat lives in `apps/HyperChat`; keep repository-wide policy, CI, and release automation at the monorepo root.
- LiveTL still consumes HyperChat through `apps/LiveTL/src/submodules/chat`. Land shared chat-side fixes in HyperChat `main`, then update that submodule pin on LiveTL `main`.

## House Style

- Commit messages should be short, direct, and readable in `git log --oneline`.
- Prefer active voice and concrete verbs:
  - `hide @ in names`
  - `fix lingering yt visuals`
  - `order matters`
- Avoid padded scopes, issue-number prefixes, and changelog-style essays in commit subjects.
- A slightly dry or funny commit is fine if it is still clear at a glance.

## Manifest Version Targets

- `main` builds three targets: `chrome` (MV3), `firefox` (MV3), and `mv2` (MV2, Firefox-only).
- The `mv2` target is **not** legacy cruft. Firefox's MV3 support is unreliable for LiveTL's needs, so LiveTL's Firefox variant consumes it. Do not "simplify" it away.
- Keep the MV2/MV3 distinction in exactly two places:
  - `src/manifest.json` — `{{mv2}}.` / `{{mv3}}.` key prefixes, resolved by `scripts/resolve-manifest.ts`. The MV tag must come **first** in nested keys (`{{mv3}}.{{firefox}}.background`); the reverse order leaks a literal tag into the built manifest.
  - `__MV__` in source — a build-time constant, so unused branches are dropped per target.
- Do not add per-MV source files (`chat-background.mv2.ts` and friends). `main`'s architecture — thin background plus the broker in `src/ts/messaging.ts` — runs under MV2 as-is. Port MV3 patterns down to MV2, never MV2's persistent-background design up.
- Prefer shared, untagged config. Only tag a key when MV2 and MV3 genuinely differ.
- Only the two MV3 zips are released. `mv2` is built in CI for breakage coverage and consumed by LiveTL via submodule.

## Build-Time Constants (submodule consumers)

`src/` depends on three bare globals, declared in `src/ts/typings/vite-env.d.ts`
and supplied by `vite.config.ts` for our own builds:

| Constant | Emitted literal | Meaning |
| --- | --- | --- |
| `__BROWSER__` | string — `"chrome"` / `"firefox"` | target browser |
| `__VERSION__` | string — `"3.3.0"` | version written into the manifest |
| `__MV__` | **number** — `2` / `3` | target manifest version |

`__MV__` is compared with strict equality (`__MV__ === 2`), so it must emit a
**number literal**. Defining it as the string `"2"` makes every check silently
false and the MV2 build takes MV3 code paths — no error, just wrong behavior.

Both bundlers do textual substitution, so the value is source text, not a JS
value. `JSON.stringify()` is the safe spelling in both:

```js
// vite
define: { __BROWSER__: JSON.stringify(browser), __MV__: JSON.stringify(2) }

// webpack — values are code fragments, so a bare string is an identifier:
//   __BROWSER__: 'firefox'  ->  emits `firefox`  ->  ReferenceError
new webpack.DefinePlugin({ __BROWSER__: JSON.stringify('firefox'), __MV__: 2 })
```

**Anything that compiles this source with its own bundler must define all three**,
or the bundle ships a reference to an undefined global and throws at runtime.
LiveTL is the one such consumer: it builds `chat-background.ts`,
`chat-injector.ts`, `chat-interceptor.ts`, `hyperchat.ts` and `options.ts` as its
own entry points, so it needs these in **both** its webpack (MV2) and vite (MV3)
configs. `__MV__` must match that consumer's own manifest version, not ours.

Used by `WelcomeMessage.svelte`, `Hyperchat.svelte`, `HyperchatButton.svelte`,
`chat-background.ts`, `chat-injector.ts`. When adding a new constant, update this
table — a missing define fails at runtime, not at build time.

## Code Patterns

- Prefer editing existing modules and utilities over creating one-off files for tiny helpers.
- If a helper obviously belongs in an existing shared utility file, put it there.
- Keep MV2 adaptation narrow:
  - change only what is required for manifest/background/injection differences
  - reach for `__MV__` only when an API genuinely differs between manifest versions
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
- The watcher resolves to MV3 Chrome scripts (`dev:chrome`/`build:chrome`) and `build/chrome` output automatically.
- The harness is Chromium-only. The MV2 target is Firefox-only, so `go-test` does not cover it — validate MV2 by loading `build/mv2` in Firefox by hand.
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
  - `npm run build:chrome -w @livetl/hyperchat`
  - `npm run build:firefox -w @livetl/hyperchat`
- Chromium extension validation is most reliable in CI/headless shells with:
  - Playwright Chromium persistent context
  - `headless=false` plus `--ozone-platform=headless`
  - extension args: `--disable-extensions-except=<build>` and `--load-extension=<build>`
- Firefox validation needs a writable browser profile owned by the current user.
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
