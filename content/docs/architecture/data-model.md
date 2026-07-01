---
title: Data model
sub: Every Supabase table and how it relates
---

## Ownership rule

Every user-owned row's PK/FK trail ends at `auth.users.id`. When a user is deleted, `ON DELETE CASCADE` on `profiles.id` and `clothing_items.user_id` fans the deletion out — no manual cleanup for their own data. Storage buckets are swept by the `/account/delete` endpoint.

## The graph

```
auth.users
   │  ON DELETE CASCADE
   ▼
profiles ─────── expo_push_token, timezone, gender, avatar_url,
                 starter_* (4 cols), daily_recs_*, re_engagement_tier,
                 has_completed_onboarding, ai_consent_at, last_active_at
   │
   ├─────────────────► clothing_items (user_id, source, starter_sku_id)
   │                       │
   │                       │  matching_set_id (self-join, users manually link)
   │                       ▼
   │                   clothing_items (same table)
   │
   ├─────────────────► outfits (top_id, bottom_id, shoes_id, dress_id, outerwear_id, accessory_id)
   │                       │        FK ON DELETE SET NULL to clothing_items
   │                       │
   │                       ├────► dismissed_outfits (item_combination text)
   │                       ├────► shared_outfits (share_code, message, share_image_url)
   │                       │           │
   │                       │           ├────► outfit_comments (user_id nullable, author_name, content, is_hidden, delete_token_hash, fingerprint)
   │                       │           │           │
   │                       │           │           └────► comment_reports (reporter_user_id, reporter_fingerprint, reason)
   │                       │           └────► outfit_reactions (user_id nullable, fingerprint, reaction_type 'up'|'down')
   │
   ├─────────────────► daily_recommendations (rec_date date, picks jsonb, pick_states jsonb, push_sent_at, seen_at, regenerated_at)
   │
   ├─────────────────► blocked_commenters (owner_user_id, blocked_user_id | blocked_fingerprint)
   ├─────────────────► upload_batches → photo_uploads
   ├─────────────────► subscriptions (plan, status, provider, current_period_*)
   ├─────────────────► payment_transactions (amount, currency, status, provider, provider_transaction_id)
   ├─────────────────► tryon_usage (month_start, count)
   ├─────────────────► user_push_tokens
   ├─────────────────► code_redemptions (redeemer_id, code_id, referrer_rewarded, redeemer_rewarded, qualifying_action_at, device_fingerprint, ip_address)
   └─────────────────► contact_messages (support inbox — no status column)

# Not user-owned — global reference tables:
starter_clothing_skus   # 36 rows, catalog of curated items; RLS public-read
promo_codes             # ambassador + gift + admin codes (owner_id nullable)
waitlist_emails         # pre-launch waitlist
```

## Every table, one-line

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`. Holds gender, timezone, avatar, starter flags, daily-rec settings, ai_consent_at, has_completed_onboarding. |
| `clothing_items` | Every clothing piece a user owns. `source ∈ {'user','starter'}`. |
| `outfits` | A saved combination — up to 6 items across slots. Has `tryon_image_url` when tried on. |
| `dismissed_outfits` | Combinations the user swiped away — blocked from re-appearing. Subset match on `item_combination`. |
| `shared_outfits` | An outfit made public via `share_code`. Has `message`, `share_image_url`. No `allow_*` toggles. |
| `outfit_comments` | Comments on a shared outfit. `user_id` nullable (anonymous web comments use `fingerprint`). `is_hidden` auto-set after 3+ reports. |
| `outfit_reactions` | Thumbs up/down per user or per anonymous fingerprint. `reaction_type` is `'up'` or `'down'`. |
| `comment_reports` | Report signals — no `status` column. 3+ reports on a comment triggers `is_hidden = true`. |
| `blocked_commenters` | Owner-scoped block list. Either `blocked_user_id` or `blocked_fingerprint`, guarded by a CHECK constraint. |
| `upload_batches` | One row per multi-photo upload session; tracks AI pipeline status. |
| `photo_uploads` | One row per photo within a batch. |
| `starter_clothing_skus` | 36-row catalog of curated starter items; public-read. |
| `subscriptions` | Current subscription state per user (plan, status, provider, cancel_at_period_end). |
| `payment_transactions` | Every payment attempt — succeeded / failed / refunded. `provider_transaction_id` unique per provider. |
| `tryon_usage` | Per-user, per-month try-on count. |
| `daily_recommendations` | Owned by `profiles.id`. `picks` (jsonb) holds the recommendations for `rec_date`; `pick_states` tracks which the user acted on. Retained 60 days by monthly cleanup cron. |
| `user_push_tokens` | Expo push tokens (multi-device). |
| `promo_codes` | Ambassador / gift / admin codes. `type` distinguishes, `owner_id` nullable. `current_uses` / `max_uses` for single-use gates. |
| `code_redemptions` | `code_id`, `redeemer_id`, reward-tracking flags + `qualifying_action_at`, plus anti-abuse fields (`device_fingerprint`, `ip_address`). |
| `contact_messages` | Support inbox — "Contact Us" form. No `status` column. |
| `waitlist_emails` | Pre-launch marketing list from the landing site. |

## Key foreign keys with `ON DELETE` behaviour

| From | To | On delete |
|---|---|---|
| `profiles.id` | `auth.users.id` | CASCADE |
| `clothing_items.user_id` | `auth.users.id` | CASCADE |
| `clothing_items.starter_sku_id` | `starter_clothing_skus.sku_id` | SET NULL |
| `outfits.top_id` (and 5 others) | `clothing_items.id` | SET NULL |
| `outfits.user_id` | `auth.users.id` | CASCADE |
| `outfit_comments.shared_outfit_id` | `shared_outfits.id` | CASCADE |
| `comment_reports.comment_id` | `outfit_comments.id` | CASCADE |
| `subscriptions.user_id` | `auth.users.id` | CASCADE |

Note the outfit slots use SET NULL, not CASCADE. Deleting one item does not delete outfits that used it — instead the slot becomes null and `annotateOutfitsMissingSlotsForItem()` in `src/services/database.service.ts` writes a `missing_slots` annotation so the UI can render a placeholder.

## RLS in one paragraph

Every user-owned table has RLS enabled with the standard `USING (user_id = auth.uid())` pattern on SELECT and `WITH CHECK (...)` on INSERT/UPDATE. `clothing_items` INSERT/UPDATE additionally require `source = 'user' AND starter_sku_id IS NULL` — starter rows are immutable to authenticated clients. `starter_clothing_skus` is public-read. Anything the backend does (seed, remove, moderate) runs as `service_role` and bypasses RLS. Trigger `guard_profile_starter_columns` blocks authenticated writes to the four `starter_*` columns on `profiles`.

**RLS on `outfit_reactions`** was historically disabled (Supabase advisor flagged it). Enabled by migration `004_enable_rls_outfit_reactions.sql`: SELECT is public (anon + authenticated `USING (true)`); INSERT/UPDATE/DELETE require `user_id = auth.uid()`; the backend continues to bypass via `service_role` for anonymous fingerprint reactions.
