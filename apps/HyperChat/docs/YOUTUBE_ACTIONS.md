# YouTube Actions (Dev Notes)

This repo implements YouTube "chat actions" (block, report, delete/retract, and mod actions) by calling Innertube endpoints based on data from the message + its context menu.

This doc exists so we do not re-learn the same YouTube quirks every time.

## Rule 0: Copy The Real Request

If native YouTube can do it and HyperChat cannot, assume our request is missing a header, context field, or tracking param. Do not "guess until it works".

When in doubt, capture:

- One request flow in native UI (extension off)
- The same flow in HyperChat (extension on)

Then diff the request bodies + headers and make HyperChat match.

## Request Inputs You Must Preserve

YouTube actions almost always depend on these fields. If you drop any of them, you get silent no-ops, missing menu items, or opaque errors.

- `context`: from `ytcfg` (`INNERTUBE_CONTEXT`)
- API key: `INNERTUBE_API_KEY`
- `clickTrackingParams`: from the UI element that spawned the action
- Message-specific params: whatever YouTube gives you for that message/menu item (`params`, `trackingParams`, etc.)
- Account identity: `x-goog-authuser` must match the active YouTube account (multi-login breaks without it)
- Visitor identity: `x-goog-visitor-id`
- Client identity: `x-youtube-client-name` and `x-youtube-client-version`
- Delegated channel identity: `x-goog-pageid` from `DELEGATED_SESSION_ID` when present

If you are unsure where a value comes from, stop and find it in:

- `ytcfg` on the page (`ytcfg.get(...)`)
- the context menu response tree
- the message renderer tree that created the menu

## Auth And Identity Headers

Some actions require a valid `Authorization: SAPISIDHASH ...` header (computed from cookies).

Do not remove SAPISIDHASH support just because a specific action seems to work without it on your machine. Deletion/retraction experiments included a successful HyperChat request with SAPISIDHASH, so the implementation keeps the computed auth path.

Do not claim SAPISIDHASH is required for every action either. The native mod-action HAR did not send `Authorization` on `get_item_context_menu`, `live_chat/moderate`, `live_chat/manage_user`, or `live_chat/live_chat_action`.

Treat "native works" as the ground truth: if native sends SAPISIDHASH for that call, we should too. If native does not send it, the HAR only proves the identity envelope around the request, not that auth is required.

For mod actions from a delegated channel, `x-goog-pageid` is part of that identity envelope. In `trying-mod-actions.har`, every relevant native request had `x-goog-pageid`; deletion/retraction captures did not. Keep this distinction visible when carrying code between MV2 and MV3.

## Endpoint Discovery: Never Hardcode Indices

YouTube reorders context menu items. Never assume "block is item 3".

Instead:

- request `get_item_context_menu`
- search the response tree for endpoint _types_
- prefer endpoint/type checks over label checks

Examples:

- block/hide/delete/timeout/unhide: `moderateLiveChatEndpoint` (but choose by menu icon/action, not by endpoint type alone)
- report: `getReportFormEndpoint` (flow can be multi-step)
- delete/retract: `moderateLiveChatEndpoint` from the delete/retract menu item

If an endpoint is missing, log enough context to diagnose:

- which endpoint types we found
- which ones we did not
- which message/menu payload we used to ask for the menu

## Delete / Retract Flow

Delete/retract is not a separate obvious top-level API. It is a context-menu action:

1. Use the message's `contextMenuEndpoint.liveChatItemContextMenuEndpoint.params`.
2. Call `live_chat/get_item_context_menu` with those params and the same Innertube identity headers YouTube uses.
3. Search the response tree for `menuServiceItemRenderer.serviceEndpoint.moderateLiveChatEndpoint`.
4. Prefer candidates whose icon is `DELETE`.
5. Fall back to label text only after endpoint and icon checks, because labels are localized and less stable.
6. POST the selected endpoint params to `live_chat/moderate`.

For streamer/mod deletes, do not infer capability from author id alone. YouTube exposes the delete affordance on each message via `inlineActionButtons`; parse that into `canDelete` and use it with the message's context-menu params.

For self retraction, use the same endpoint discovery path. It may still be a `moderateLiveChatEndpoint`; the important distinction is the menu item YouTube returned for that message/account state, not a different hardcoded endpoint.

## Context Shape Matters

The deletion/retraction HARs proved that "success: true" is not enough. A sloppy request can return a successful response with the wrong chat action.

For `live_chat/get_item_context_menu`, native requests used:

- `context.adSignalsInfo`
- `context.client`
- `context.request`
- `context.user`

They did not include `context.clickTracking`.

For the actual mutation request (`live_chat/moderate`, `live_chat/manage_user`, or `live_chat/live_chat_action`), native requests used the same context plus endpoint-specific `context.clickTracking.clickTrackingParams` from the selected returned endpoint.

Do not carry stale click tracking from the base context into the context-menu request. Do not invent click tracking for the mutation request. Copy it from the selected endpoint.

## Mod Action Learnings

The captured mod-action HAR (`artifacts/build/trying-mod-actions.har`) is enough to reconstruct the exact native YouTube flows. All mutation requests start from a message's `contextMenuEndpoint.liveChatItemContextMenuEndpoint.params`, then call `live_chat/get_item_context_menu`, then execute the endpoint attached to the selected menu item or nested option.

Do not resolve mod actions by grabbing the first `moderateLiveChatEndpoint`. In moderator menus, delete, timeout, hide, and unhide all use `moderateLiveChatEndpoint`. The action identity comes from the menu item icon, and for dialog-backed actions, from the selected nested option.

Known menu/action mapping:

- `KEEP` / `Pin message`: top-level `liveChatActionEndpoint` -> `live_chat/live_chat_action`
- `KEEP` / `Replace pinned message`: top-level `liveChatActionEndpoint` -> `live_chat/live_chat_action`
- `DELETE` / `Remove`: top-level `moderateLiveChatEndpoint` -> `live_chat/moderate`
- `HOURGLASS` / `Put user in timeout`: nested option `submitEndpoint.moderateLiveChatEndpoint` -> `live_chat/moderate`
- `REMOVE_CIRCLE` / `Hide user on this channel`: top-level `moderateLiveChatEndpoint` -> `live_chat/moderate`
- `ADD_CIRCLE` / `Unhide user on this channel`: top-level `moderateLiveChatEndpoint` -> `live_chat/moderate`
- `ADD_MODERATOR` / `Add as moderator`: nested option `submitEndpoint.manageLiveChatUserEndpoint` -> `live_chat/manage_user`
- `REMOVE_MODERATOR` / `Remove as managing moderator`: top-level `manageLiveChatUserEndpoint` -> `live_chat/manage_user`
- `REMOVE_MODERATOR` / `Remove as standard moderator`: top-level `manageLiveChatUserEndpoint` -> `live_chat/manage_user`
- `FLAG` / `Report`: top-level `getReportFormEndpoint` -> `flag/get_form`, then `flag/flag`
- `WATCH_HISTORY` / `Channel Activity`: `showEngagementPanelEndpoint`; this opens YouTube's engagement panel and is not a moderation mutation request

Nested timeout options captured from the native dialog:

- `10 seconds`
- `1 minute`
- `5 minutes`
- `10 minutes`
- `30 minutes`
- `24 hours`

Nested add-moderator options captured from the native dialog:

- `Managing moderator`
- `Standard moderator`

Exact captured demo sequence:

1. Menu entry `187`: selected `KEEP` / `Pin message`; POST entry `196` to `live_chat/live_chat_action`; response showed `Message pinned`, `Undo`, and `addBannerToLiveChatCommand`.
2. Menu entry `227`: selected `DELETE` / `Remove`; POST entry `229` to `live_chat/moderate`; response had `markChatItemAsDeletedAction` with `[message retracted]`.
3. Menu entry `437`: selected `KEEP` / `Replace pinned message`; POST entry `443` to `live_chat/live_chat_action`; response showed `Message pinned`, `Undo`, and a pinned banner update.
4. Menu entry `453`: selected `DELETE` / `Remove`; POST entry `460` to `live_chat/moderate`; response had `markChatItemAsDeletedAction` with `Message deleted by @livetl-vtuberclipsch.8354.`.
5. Menu entry `466`: selected `HOURGLASS` / `Put user in timeout`, nested option `1 minute`; POST entry `478` to `live_chat/moderate`; response toast said `@KentoNishi has been timed out for 1 minute`.
6. Menu entry `531`: selected `ADD_MODERATOR` / `Add as moderator`, nested option `Managing moderator`; POST entry `543` to `live_chat/manage_user`; response toast said `@KentoNishi is now a managing moderator for your channel`.
7. Menu entry `545`: selected `REMOVE_MODERATOR` / `Remove as managing moderator`; POST entry `551` to `live_chat/manage_user`; response toast said `@KentoNishi is no longer a managing moderator for your channel`.
8. Menu entry `554`: selected `ADD_MODERATOR` / `Add as moderator`, nested option `Standard moderator`; POST entry `561` to `live_chat/manage_user`; response toast said `@KentoNishi is now a standard moderator for your channel`.
9. Menu entry `564`: selected `REMOVE_MODERATOR` / `Remove as standard moderator`; POST entry `568` to `live_chat/manage_user`; response toast said `@KentoNishi is no longer a standard moderator for your channel`.
10. Menu entry `578`: selected `REMOVE_CIRCLE` / `Hide user on this channel`; POST entry `584` to `live_chat/moderate`; response toast said `This user's messages will be hidden` and included an `Undo` button.
11. Menu entry `590`: selected `ADD_CIRCLE` / `Unhide user on this channel`; POST entry `594` to `live_chat/moderate`; response was an empty success.
12. Menu entry `597`: selected `REMOVE_CIRCLE` / `Hide user on this channel`; POST entry `602` to `live_chat/moderate`; response toast said `This user's messages will be hidden` and included an `Undo` button.
13. Response entry `602`: clicked the hide toast's `Undo` button; POST entry `605` to `live_chat/moderate`; response was an empty success.

The hide/unhide flow therefore has two proven unhide sources: the context menu's `ADD_CIRCLE` item and the `Undo` button endpoint returned by a successful hide response. For HyperChat's message action menu, use the context-menu `ADD_CIRCLE` path. If HyperChat later renders native-style action toasts, the response-button endpoint is also valid.

The mod-action HAR contains `FLAG` / `Report` menu items, but it does not contain an executed report submission. Use the existing report flow for report execution unless a new report-specific HAR says otherwise.

Block and report predate the full mod-action work and should be treated as existing behavior, not new HAR-derived features. The HAR lessons still apply to their shared context-menu request shape and endpoint selection, but do not remove existing block/report UI affordances just because some messages lack context-menu params. That path may fail through the executor today, but hiding it would be a behavior change without a proven replacement.

## Mod Action Implementation Plan

Everything currently implemented for block, report, delete/retract, message parsing, queueing, and MV2 background forwarding works and must not regress. Implement mod actions by preserving the existing architecture and changing only the pieces required to select and execute the correct YouTube endpoints.

Constraints:

- Do not rewrite the common menu component.
- Do not make the message menu dynamically fetch native YouTube menu items on open.
- Do not replace the background/interceptor message flow.
- Do not change deletion/retraction UI state handling except where endpoint selection must become more precise.
- Do not ingest arbitrary action response bodies into the queue in the first mod-action pass.

Implementation shape:

1. Keep the static HyperChat message menu.
2. Add explicit action constants/menu entries for the supported mod actions.
3. Use the existing report-dialog pattern for actions that need a choice:
   - timeout duration: `10 seconds`, `1 minute`, `5 minutes`, `10 minutes`, `30 minutes`, `24 hours`
   - add moderator role: `Managing moderator`, `Standard moderator`
4. Keep `useBanHammer`, `executeChatAction`, `chatUserActionResponse`, and MV2 background forwarding structurally intact.
5. Inside the action executor, keep the existing `get_item_context_menu` request and proxy fetch flow, but make the request shape match the HAR:
   - context-menu request: no `clickTracking`
   - mutation request: endpoint-specific `clickTrackingParams`
   - identity headers: active account, visitor, client name/version, origin, and delegated `x-goog-pageid` when present
   - SAPISIDHASH support remains available, but the mod-action HAR does not prove it is required
6. Replace fragile endpoint selection with icon-aware resolution:
   - `DELETE_MESSAGE`: `DELETE` + `moderateLiveChatEndpoint`
   - `PIN_MESSAGE`: `KEEP` + `liveChatActionEndpoint`
   - `HIDE_USER`: `REMOVE_CIRCLE` + `moderateLiveChatEndpoint`
   - `UNHIDE_USER`: `ADD_CIRCLE` + `moderateLiveChatEndpoint`
   - `TIMEOUT_USER`: `HOURGLASS` + selected nested option's `moderateLiveChatEndpoint`
   - `ADD_MODERATOR`: `ADD_MODERATOR` + selected nested option's `manageLiveChatUserEndpoint`
   - `REMOVE_MODERATOR`: `REMOVE_MODERATOR` + `manageLiveChatUserEndpoint`
   - `REPORT_USER`: existing report form flow
   - `BLOCK`: only a real `BLOCK` menu item; do not fall back to the first `moderateLiveChatEndpoint`
7. Keep local success side effects narrow:
   - `DELETE_MESSAGE`: keep the current local deleted-message replacement.
   - `BLOCK`: keep current removal of that author's visible messages.
   - `REPORT_USER`: keep current removal of that author's visible messages.
   - `HIDE_USER`: may remove that author's visible messages, matching the user-visible effect of hiding.
   - pin, timeout, add moderator, remove moderator, and unhide: show success/failure only.
8. Implement in `apps/HyperChat` on a monorepo feature branch targeting `main`. LiveTL consumes the shared source; port applicable changes into `apps/YtcFilter` before release.

Regression guardrails:

- Existing delete/retract behavior must continue to work for self messages, own streams, other streams, and moderator deletes.
- Existing report behavior must keep the same dialog and request flow.
- Existing block behavior must not accidentally execute delete/hide/timeout just because those share `moderateLiveChatEndpoint`.
- Existing block/report visibility rules must not be tightened as part of mod actions.
- Existing queue/parser deletion handling must remain the source of truth for YouTube-originated delete updates.
- If a static HyperChat action is unavailable in YouTube's context menu, fail gracefully through `chatUserActionResponse` instead of guessing another endpoint.

## Keep Requests Correlated

If you proxy Innertube calls through a background/service worker, keep request/response events correlated by request id.

Do not use global listeners or "last response wins" patterns. Two actions can overlap, and the wrong response breaks the UI in confusing ways.

## UI State: Be Honest

When we apply an action locally, separate request success from YouTube's later chat-state echo.

For delete/retract:

- on local request success: mark the message as pending deleted, but keep the original runs available locally
- on `markChatItemAsDeletedAction`: replace with YouTube's deleted-state message
- on `removeChatItemAction`: treat the target message as pending deleted if YouTube only tells us to remove the item
- on `markChatItemsByAuthorAsDeletedAction`: apply the deleted-state message to messages from that author
- if YouTube provides `showOriginalContentMessage`, keep it as a view-original toggle for moderator contexts
- on failure: keep it visible and surface an error

Do not mutate the parsed message text in place. Keep the original parsed runs and choose the displayed runs at the render edge. Otherwise pending state, "view deleted message", and later YouTube confirmation can clobber each other.

## HAR + DevTools Tips (So You Do Not Lose The Payload)

- Enable "Preserve log" before doing the flow.
- Export as "HAR with content" so request/response bodies are included.
- If a body looks truncated, open the request and use the raw view in DevTools (Chrome often still has it).

## Where This Usually Breaks

- Missing `x-goog-authuser` (multi-account sessions)
- Missing `x-goog-pageid` when acting as a delegated channel
- Dropped `clickTrackingParams` / message `params`
- Carrying `clickTracking` into `get_item_context_menu`
- Wrong Innertube client name/version (YouTube serves different schemas)
- SAPISIDHASH removed where native/working HC requests require it, or computed for the wrong origin
- Context menu parsing tied to item index instead of endpoint types
