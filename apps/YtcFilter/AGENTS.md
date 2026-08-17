# YtcFilter Codex Workflow

Paths and commands in this file are relative to `apps/YtcFilter` unless noted otherwise.

## Scope

- YTCF is a Chrome/Firefox MV3 extension app in the LiveTL monorepo.
- YTCF product behavior is filters, presets, triggers, archives, setup, settings, and the YTCF button/panel UI.
- Some chat runtime code is adapted from shared chat runtime history. Preserve ancestry when requested, but resolve final code as an adapted YTCF port, not a blind file copy.

## Branch Discipline

- Work on the active monorepo feature branch unless the user explicitly asks for a different branch.
- Keep repository-wide policy, CI, and release automation at the monorepo root.
- Commit subjects should be short, direct, and readable in `git log --oneline`.

## Runtime Sync Model

- If a fix belongs to shared chat runtime behavior that is maintained in
  HyperChat, land it there first, then port or merge it into YTCF.
- Prefer proper merge/subtree history when the user asks for ancestry.
- Resolve conflicts in YTCF terms:
  - keep YTCF filters, presets, triggers, archives, setup, settings, and panel controls
  - take shared runtime fixes in parsing, rendering, messaging, queueing, embed cleanup, and YouTube action plumbing
- It is acceptable to adopt monorepo build/runtime structure when that is the cleaner final architecture.

## Runtime Model

- `src/scripts/chat-injector.ts` installs the interception path on native YouTube chat pages and mounts the YTCF button bar.
- `src/scripts/chat-mounter.ts` mounts the YTCF panel into `https://www.youtube.com/embed/ytcfilter_embed?...`.
- `src/ts/chat-parser.ts` normalizes YouTube chat actions.
- `src/ts/queue.ts` handles live/replay timing.
- `src/ts/messaging.ts` bridges the injected YouTube side and the mounted UI side.
- `src/ts/ytcf-logic.ts` owns filtering, preset activation, archive behavior, and metadata handling.
- The rendered chat is filtered output, not the raw feed. A message is shown only if it matches the active preset.

## Important Behavior Notes

- Filters are keep-rules, not hide-rules:
  - conditions inside one filter are AND
  - filters inside a preset are OR
  - a message is shown if it matches an enabled filter
- Presets can auto-activate from channel/video metadata.
- Archives are real YTCF data, not incidental debug output.
- `Block user` and `Report user` are YouTube-side actions.
- `Delete` in the message menu is local YTCF-side removal from the current rendered/archive view.
- Keep author/channel identity data untouched and apply display-only formatting at render edges.
- Use `src/ts/component-utils.ts` for author-name formatting.
- Do not assume fixed YouTube menu indices for block/report behavior.
- Keep proxy fetch request/response events correlated by request id.

## Build And Tooling

- Use `npm`, not `yarn`.
- Install from the monorepo root:
  - `npm ci`
- Main commands from the monorepo root:
  - `npm run build -w @livetl/ytcfilter`
  - `npm run build:chrome -w @livetl/ytcfilter`
  - `npm run build:firefox -w @livetl/ytcfilter`
  - `npm run dev:chrome -w @livetl/ytcfilter`
  - `npm run dev:firefox -w @livetl/ytcfilter`
- Convenience root command:
  - `npm run build:ytcfilter`
- Unpacked output layout:
  - Chrome build: `apps/YtcFilter/build/chrome`
  - Firefox build: `apps/YtcFilter/build/firefox`
  - release artifacts: `apps/YtcFilter/build`

## Runtime Validation

- A fresh profile redirects into setup until `ytcf.initialSetupDone` is true.
- Preset/filter edits are not expected to hot-patch an already mounted filtered panel.
- After changing filters in settings, reload/remount the panel before judging runtime behavior.
- Useful extension pages:
  - `setup.html`
  - `options.html`
  - `hyperchat.html`
- `scripts/codex-dev.sh go-test` starts a Chromium smoke session for the YTCF build.
- Default testbed URL comes from `vite.config.ts`:
  - `https://www.youtube.com/watch?v=X4VbdwhkE10`
- Treat `scripts/codex-dev.sh reload` as the default after significant runtime changes to:
  - `src/scripts/**`
  - `src/components/**`
  - `src/ts/**`
  - `src/manifest.json`
  - `vite.config.ts`

## Release Notes And Changelog Style

### In-Product Changelog Style

- The in-product changelog is a single plain-text line:
  - `src/components/changelog/YtcFilterChangelog.svelte`
- It must be user-facing only.
- It must be extremely short.
- Start with lowercase unless a proper noun forces capitalization.
- Do not use HTML, lists, or multiple lines.
- Example:
  - `fix visual conflicts w/ YT`

### GitHub Release Notes Style

- Match the existing release format:

```md
## Here's what's new in vX.Y.Z:

- fix visual conflicts w/ YT
```

- Keep it to one bullet unless the user explicitly asks for more.
- The bullet must be user-facing only.

## Emoji Placeholder Handling

- Treat legacy member emoji placeholders (`U+25A1`, rendered as `□`) as emoji-equivalent for filtering.
- In `HIDE_ALL` mode, do not render these placeholders in `MessageRuns.svelte`.
- For emoji-only spam detection, count placeholder-only text runs as emoji in `isAllEmoji`.

## Embed 404 Notes

- The embed fallback page (`/embed/ytcfilter_embed`) can render a centered YouTube logo/error artifact if page elements are not fully removed.
- In `src/scripts/chat-mounter.ts`, treat the YTCF mount root as the only allowed direct `body` child and aggressively remove fallback embed artifacts.
