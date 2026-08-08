# YouTube Actions (Dev Notes)

This repo implements YouTube "chat actions" (block, report, delete/retract, and future mod actions) by calling Innertube endpoints based on data from the message + its context menu.

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

## Auth: SAPISIDHASH Still Matters

Some actions require a valid `Authorization: SAPISIDHASH ...` header (computed from cookies).

Do not remove SAPISIDHASH support just because a specific action seems to work without it on your machine. It can break on:

- different accounts
- different regions
- different browsers
- multi-login sessions

Treat "native works" as the ground truth: if native sends SAPISIDHASH for that call, we should too.

## Endpoint Discovery: Never Hardcode Indices

YouTube reorders context menu items. Never assume "block is item 3".

Instead:

- request `get_item_context_menu`
- search the response tree for endpoint *types*
- prefer endpoint/type checks over label checks

Examples:

- block: `moderateLiveChatEndpoint` (and friends)
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
- Dropped `clickTrackingParams` / message `params`
- Wrong Innertube client name/version (YouTube serves different schemas)
- SAPISIDHASH removed or computed for the wrong origin
- Context menu parsing tied to item index instead of endpoint types
