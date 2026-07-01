---
title: Route reference
sub: Every HTTP endpoint
---

All routes are prefixed with `/api/v1`. Auth notation:
- **🔓** = public
- **🔒** = requires `Authorization: Bearer <supabase-jwt>` (verified via `src/plugins/auth.ts`)
- **🤖** = auth AND `ai_consent_at IS NOT NULL` on the profile

Prefixes registered in `src/routes/index.ts`. This reference lists real endpoints only — cross-checked against `grep 'fastify\.(get|post|patch|delete|put)' src/routes/*.ts`.

## `/api/v1/ai/*`

- **POST** `/ai/tag-clothing` 🤖 — kicks off the wardrobe AI pipeline for a batch. Body: `{ batchId, urls, gender }`.
- **POST** `/ai/retry-failed` 🤖 — retry failed items in an existing batch.
- **POST** `/ai/virtual-tryon` 🤖 — try-on generation. Body: `{ userImageUrl, clothingItemIds, gender }`. **Coin-gated (5).**
- **GET** `/ai/virtual-tryon/usage` 🔒 — current coin balance + cost.
- **GET** `/ai/usage` 🔒 — per-user photo-processing usage (today + this month) + limits + remaining. Distinct from `/virtual-tryon/usage`.

## `/api/v1/batches/*`

- **GET** `/batches` 🔒 — list the user's recent upload batches.
- **GET** `/batches/:batchId` 🔒 — batch metadata.
- **GET** `/batches/:batchId/status` 🔒 — poll status: `processing` | `completed` | `failed`.
- **GET** `/batches/:batchId/results` 🔒 — inserted item IDs + AI outputs.
- **POST** `/batches/:batchId/cleanup` 🔒 — delete originals + intermediates after items are committed.

## `/api/v1/wardrobe/*`

- **GET** `/wardrobe` 🔒 — list items. Filters: `topCategory`, `category`, `archived`, `source`, `limit`, `offset`.
- **GET** `/wardrobe/stats` 🔒 — counts by category/archived/source. Cached ~120s.
- **GET** `/wardrobe/:itemId` 🔒
- **GET** `/wardrobe/:itemId/outfit-impact` 🔒 — preview outfit slots that reference this item.
- **PATCH** `/wardrobe/:itemId` 🔒 — user edits (rejects starter → 403 `STARTER_READ_ONLY`).
- **DELETE** `/wardrobe/:itemId` 🔒 — remove one; annotates outfits + dissolves singleton sets.
- **POST** `/wardrobe/:itemId/reextract` 🤖 — re-run AI extraction.
- **PATCH** `/wardrobe/:itemId/archive` 🔒
- **PATCH** `/wardrobe/:itemId/unarchive` 🔒
- **POST** `/wardrobe/:itemId/replace` 🔒 — swap across outfits.
- **POST** `/wardrobe/:itemId/unlink-set` 🔒
- **POST** `/wardrobe/sets` 🔒 — create a matching set from N ≥ 2 items.
- **DELETE** `/wardrobe/sets/:setId` 🔒 — dissolve.
- **GET** `/wardrobe/starter-personas` 🔒 — gender + geo-filtered list.
- **POST** `/wardrobe/seed-starter` 🔒 — pick a persona. Rate-limited **5/hour**.
- **DELETE** `/wardrobe/starter` 🔒 — bulk remove starter items.
- **GET** `/wardrobe/starter/impact` 🔒 — pre-delete preview.
- **POST** `/wardrobe/starter/dismiss-banner` 🔒 — hide the Home banner forever.

## `/api/v1/outfits/*`

- **POST** `/outfits/generate` 🔒 — outfit suggestions. **Free** (pure algorithm).
- **POST** `/outfits` 🔒 — save one outfit.
- **GET** `/outfits` 🔒 — list. Filters: `startDate`, `endDate`, `sortBy`.
- **GET** `/outfits/:outfitId` 🔒
- **PATCH** `/outfits/:outfitId` 🔒 — rename, edit slots, change planned date.
- **DELETE** `/outfits/:outfitId` 🔒
- **PATCH** `/outfits/:outfitId/wear` 🔒 — mark worn (increments a wear counter used by the recently-worn filter).
- **POST** `/outfits/:outfitId/duplicate` 🔒
- **POST** `/outfits/dismiss` 🔒 — swipe away. Body: `{ itemIds }` — records combination in `dismissed_outfits`.
- **GET** `/outfits/dismissed` 🔒 — list dismissed combinations.
- **GET** `/outfits/dismissed/count` 🔒
- **DELETE** `/outfits/dismissed` 🔒 — unblock all.
- **DELETE** `/outfits/dismissed/:dismissedId` 🔒 — unblock one.

## `/api/v1/outfits/*` (sharing — authenticated half)

Registered from `sharing.routes.ts` under the same prefix:

- **POST** `/outfits/:outfitId/share` 🔒 — mint a share code. Body: `{ message?, shareImageUrl? }`.
- **GET** `/outfits/shares` 🔒 — list the user's active shares.
- **GET** `/outfits/shares/stats` 🔒 — aggregate share performance.
- **DELETE** `/outfits/shares/:shareId` 🔒 — revoke a share by share id (not outfit id).

## `/api/v1/shared/*` (sharing — public half)

Registered under a second prefix. All routes here take a `:shareCode` short slug:

- **GET** `/shared/:shareCode` 🔓 — public read.
- **GET** `/shared/:shareCode/comments` 🔓 — list comments.
- **POST** `/shared/:shareCode/comments` 🔓 — add comment. Body: `{ content, authorName }`. JWT optional (links identity when present); otherwise IP+UA fingerprint. Runs `findProfanity`.
- **GET** `/shared/:shareCode/reactions` 🔓 — list reactions.
- **POST** `/shared/:shareCode/reactions` 🔓 — toggle. Body: `{ reactionType: 'up' | 'down' }`. Same identity rules as comments.
- **DELETE** `/shared/comments/:commentId` 🔒 — signed-in commenter deletes their own comment (mobile path).
- **POST** `/shared/comments/:commentId/delete` 🔓 — anonymous / web-side self-delete via a per-comment `deleteToken` issued at create time.
- **DELETE** `/shared/comments/:commentId/owner` 🔒 — the share owner deletes any comment on their outfit.
- **POST** `/shared/comments/:commentId/report` 🔓 — flag for review. When a comment accumulates 3+ reports, `sharing.service.ts` sets `outfit_comments.is_hidden = true` inline (app-level, not a DB trigger).
- **POST** `/shared/comments/:commentId/block` 🔒 — share owner blocks the commenter from future comments on their shares.
- **DELETE** `/shared/blocked/:blockId` 🔒 — unblock.

Reactions are thumbs-up/thumbs-down only, not arbitrary emoji. Comments are flat (no reply threading).

## `/api/v1/avatar/*`

- **POST** `/avatar/process` 🤖 — `{ imageUrl }`. Imageurl must resolve to the caller's own `clothing-images` bucket path (SSRF-guarded in `src/schemas/avatar.schema.ts`).

## `/api/v1/subscription/*`

- **GET** `/subscription` 🔒 — current plan, status, cancel-at-period-end.
- **GET** `/subscription/coins` 🔒 — coin balance + costs.
- **GET** `/subscription/plans` 🔒 — available plans + prices.
- **POST** `/subscription/charge` 🔒 — debit coins. Body: `{ action: 'outfit_planning' }` — the only accepted action. Virtual try-on charges are handled inside `POST /ai/virtual-tryon` (not via this endpoint), and outfit *generation* is free.

There is no `/subscription/refund` or `/subscription/coin-history` endpoint. Coin history is derived from RC's ledger. Refunds are internal — no HTTP route.

## `/api/v1/webhooks/*`

- **POST** `/webhooks/paystack` 🔓 — Paystack webhook. Signature-verified. INSERT-as-lock idempotency.
- **POST** `/webhooks/revenuecat` 🔓 — RC webhook. Signature-verified. Handles INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, REFUND, PRODUCT_CHANGE, INITIAL_PURCHASE_TRIAL.

## `/api/v1/payment/*`

- **POST** `/payment/checkout-token` 🔒 — mints an HMAC-signed token used by `/subscribe` on the landing site. Response: `{ token, expiresIn }`. Env: `CHECKOUT_TOKEN_SECRET` (falls back to `SUPABASE_JWT_SECRET` outside prod).
- **GET** `/payment/identity` 🔓 — resolves `?token=<hmac>` → basic user identity for the checkout page. No JWT auth. Rate-limited 30/min.
- **POST** `/payment/initialize` 🔓 — starts a Paystack transaction. Accepts either a checkout token (signed-in user path) or `{ email }` (anonymous flow). Rate-limited 6/min.
- **GET** `/payment/verify` 🔓 — verifies a Paystack transaction by `?reference=<ref>`. No JWT auth. Rate-limited.
- **GET** `/payment/plans` 🔓 — plans + prices for the landing checkout UI.
- **POST** `/payment/lookup-by-email` 🔓 — looks up whether an email address has an active subscription (for the /invite landing page).

## `/api/v1/codes/*` — user

- **POST** `/codes/redeem` 🔒 — `{ code }`. Handles ambassador + gift + admin codes uniformly.
- **GET** `/codes/my-referral` 🔒 — an ambassador's own code + stats.
- **GET** `/codes/info/:code` 🔓 — public code preview (used by landing `/invite/[code]`).
- **GET** `/codes/:code/stats` 🔒 — stats for a code the caller owns.

## `/api/v1/admin/codes/*`

- **POST** `/admin/codes/` 🔒 — create a promo/ambassador/gift/admin code.
- **GET** `/admin/codes/` 🔒 — list all codes with filters.
- **GET** `/admin/codes/:code/stats` 🔒 — redemption stats for a code.
- **DELETE** `/admin/codes/:code` 🔒 — deactivate (does not delete rows).

## `/api/v1/account/*`

- **POST** `/account/delete` 🔒 — body `{ reason? }`. Sweeps `clothing-images` bucket subfolders then calls `supabase.auth.admin.deleteUser(id)`. CASCADE fans through profiles/clothing_items/outfits/subscriptions/etc.

There is no `POST /account` or `DELETE /account` — direct profile updates go through Supabase from the client (with RLS enforcement).

## `/api/v1/waitlist/*`

- **POST** `/waitlist/send-invites` 🔒 — admin batch. Body: `{ adminSecret, testFlightUrl, playStoreUrl, emails?[] }`. Sends invites via Resend and stamps `invited_at`. Auth is a body-secret, not JWT.

## `/api/v1/cron/*`

See **[Cron jobs](/control/docs/backend/cron)** for schedule + auth pattern.

- **POST** `/cron/re-engagement`
- **POST** `/cron/subscription-reminders`
- **POST** `/cron/reap-stuck-transactions`
- **POST** `/cron/daily-recommendations` (endpoint exists; not currently pg_cron-scheduled)

## `/api/v1/daily-recommendations/*`

- **GET** `/daily-recommendations/today` 🔒 — lazily generates and returns today's rec in the user's local timezone. Returns a reason code (`DISABLED`, `INSUFFICIENT_WARDROBE`, etc.) when no rec is possible.
- **POST** `/daily-recommendations/regenerate` 🔒 — allows one regeneration per local day.

## Health check

- **GET** `/health` 🔓 (no `/api/v1` prefix) — Railway health probe. Returns `{ ok: true }`.

## Not implemented (yet)

- Any admin dashboard REST surface — control panel reads Supabase directly via service role.
- Per-endpoint delete/mute for the ambassador program (manual SQL).
- Rich support-inbox flow (Contact Us form → Resend email → landing-only, no backend endpoint).
