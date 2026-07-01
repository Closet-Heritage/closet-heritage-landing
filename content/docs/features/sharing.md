---
title: Sharing & comments
sub: Public outfits, thumbs, moderation
---

## Mental model

A saved outfit is private by default. The user can mint a **share code** (short unguessable slug on `shared_outfits.share_code`) that anyone can open. Comments + thumbs on that shared outfit are open to any signed-in Closet Heritage user (and, for anonymous web viewers, a fingerprint-tracked mode with rate limits). No DMs, no follower graph, no algorithmic feed.

## Turning an outfit public

Mobile: outfit detail → Share sheet → optional message + branded image → Save. Backend:

- `POST /api/v1/outfits/:outfitId/share` with `{ message?, shareImageUrl? }` inserts into `shared_outfits`.
- Response includes `share_code` (e.g. `aB3kX9mQ`) and the full URL `https://closetheritage.com/shared/<code>`.

There is **no** `allow_comments` / `allow_reactions` toggle — every share allows both. Moderation is per-comment (below).

Revoking a share:
- `DELETE /api/v1/outfits/shares/:shareId` (share id, not outfit id). CASCADE deletes all comments + reactions.

## Viewing a shared outfit

The URL `/shared/[shareCode]` opens either:

- **Landing site** (Next.js) — a public read-only view for people without the app.
- **Mobile deep link** — the app takes over if installed.

Both paths call `GET /api/v1/shared/:shareCode` (public, no auth) which returns the outfit + comments + reactions counts.

## Comments

`outfit_comments` rows. Columns include `user_id` (nullable — anonymous web commenters have NULL here, identified by `fingerprint = SHA-256(ip + ua)`), `author_name`, `content`, `is_hidden`, `delete_token_hash`.

Insert flow:

1. Client: `POST /api/v1/shared/:shareCode/comments` with `{ content, authorName }`.
2. Backend runs `findProfanity()` (`src/utils/content-filter.ts`); if flagged, reject 400 without inserting.
3. Insert row. Trigger fires Realtime broadcast on the table if configured.
4. Any device subscribed to the shared outfit's comment thread receives the new row over WebSocket.

Client hook: `useSharedComments(shareCode)`.

## Reactions

Thumbs-up / thumbs-down only. `outfit_reactions.reaction_type` is `'up'` or `'down'`. Anonymous reactors deduped via `fingerprint`, signed-in reactors by `user_id`. One row per identity per shared outfit.

`POST /api/v1/shared/:shareCode/reactions` with `{ reactionType: 'up' | 'down' }` toggles.

## Moderation

Two mechanisms:

**Reports** — anyone can report a comment. `POST /api/v1/shared/comments/:commentId/report` inserts into `comment_reports`. No `status` column — reports are write-only signals. Once a comment accumulates 3 reports, `sharing.service.ts:reportComment` sets `outfit_comments.is_hidden = true` inline (app-level, not a DB trigger). The comment silently disappears from the public view. The control-panel dashboard surfaces recent report counts.

**Blocks** — share-owner action. `blocked_commenters` has `owner_user_id` (the share owner) + either `blocked_user_id` (signed-in commenter) or `blocked_fingerprint` (anonymous). Insert flow: `POST /api/v1/shared/comments/:commentId/block`. On comment insert the backend checks the block list and rejects.

Unblock: `DELETE /api/v1/shared/blocked/:blockId`.

Two comment-delete paths:

- Commenter deletes their own: `POST /api/v1/shared/comments/:commentId/delete` (holds either `user_id` match, or `deleteTokenHash` match for anonymous web).
- Owner deletes a comment on their outfit: `DELETE /api/v1/shared/comments/:commentId/owner`.

## Push notifications on new comments

When a comment is added to an outfit the user owns, `notification.service.ts` sends a push. Deep-links to the shared outfit view. Falls back silently if the user has no push token.

## Threading

There is no reply-to. Comments are a flat chronological list per shared outfit. Simpler code, less abuse surface.

## Privacy nuance

The share code is unguessable but not treated as secret — search engines will crawl `/shared/*` URLs. Users are told this in the share sheet.

## Files you'd touch

| Concern | File |
|---|---|
| Backend routes | `ch-backend-main/src/routes/sharing.routes.ts` (registered under both `/outfits` and `/shared` prefixes) |
| Content filter | `ch-backend-main/src/utils/content-filter.ts` (`findProfanity`) |
| Notifications | `ch-backend-main/src/services/notification.service.ts` |
| Mobile — shared view | `closet-heritage-app/app/shared/[shareCode].tsx` |
| Mobile — hooks | `closet-heritage-app/hooks/useSharing.ts` (`useSharedComments`, `useCreateShare`, `useDeleteShare`, `useToggleReaction`) |
| Landing — shared view | `closet-heritage-landing/app/shared/[shareCode]/page.tsx` |
