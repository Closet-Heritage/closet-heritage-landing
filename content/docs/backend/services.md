---
title: Services
sub: Business-logic layer
---

Every route handler is thin. All business logic lives under `src/services/`. Services never touch `request` / `reply` — they take primitives, return data or throw. This keeps them testable and reusable across cron + HTTP.

## The map (verified against `ls src/services/`)

| Service | What it owns |
|---|---|
| `outfit.service.ts` (~2,500 LOC) | Outfit generation algorithm — the biggest piece of code we own. See **[Outfit matching](/control/docs/features/outfit-matching)**. |
| `virtual-tryon.service.ts` (~440 LOC) | Gemini try-on pipeline with hedged fallback + BG removal + coin debit. See **[Virtual try-on](/control/docs/features/virtual-tryon)**. |
| `workflow.service.ts` | Orchestrates the wardrobe upload pipeline — validate → grid → tag → crop → verify → re-extract → BG-remove → upload. Owns the per-batch state machine. |
| `grid-generation.service.ts` | Gemini 3.1 Flash Image call that composes the clean-background item grid. |
| `tagging.service.ts` | Per-item Gemini tagging + retry on schema-mismatch. |
| `duplicate-detection.service.ts` | On wardrobe upload, checks if a new item's color+subcategory+attributes match an existing one and prompts to merge. Excludes starter items from the candidate pool. |
| `background-removal.service.ts` | remove.bg (primary) + @imgly (fallback). |
| `image.service.ts` | Fetch, sharp-compress, upload to Supabase Storage. |
| `avatar.service.ts` | Gemini validation → sharp crop → Supabase upload → profile update. |
| `subscription.service.ts` | Coin costs, `canUserTryon`, `chargeForTryon`, `depositCoins`, `debitCoins`, `getCoinBalance`. Talks to RevenueCat V2. |
| `notification.service.ts` | Expo push. |
| `daily-recommendations.service.ts` | Picks + records the day's outfit rec per user. |
| `sharing.service.ts` | Share code minting, comment moderation helpers, reaction dedup. |
| `referral.service.ts` | Redemption bookkeeping + reward-triggering after qualifying action. |
| `database.service.ts` | Shared DB helpers used across services: `annotateOutfitsMissingSlotsForItem`, `cleanupDismissedOutfitsForItem`, `deleteEmptyOutfits`, `getWardrobeByCategory`, `getOutfitsUsingItem`. |
| `realtime.service.ts` | Postgres Changes helpers for the mobile Realtime subscription. |
| `health.service.ts` | Health check aggregation for `/health`. |

## Import graph — who calls whom

```
ai.routes.ts
   ├──► workflow.service.ts
   │       ├──► grid-generation.service.ts ─► gemini.ts
   │       ├──► tagging.service.ts          ─► gemini.ts
   │       ├──► duplicate-detection.service.ts
   │       ├──► image.service.ts             ─► Supabase Storage
   │       ├──► background-removal.service.ts
   │       └──► database.service.ts
   └──► virtual-tryon.service.ts
           ├──► subscription.service.ts (canUserTryon, chargeForTryon)
           ├──► image.service.ts
           ├──► background-removal.service.ts
           └──► gemini.ts

batches.routes.ts
   └──► workflow.service.ts (status polling)

wardrobe.routes.ts
   ├──► database.service.ts (getFilteredWardrobe, annotate/cleanup helpers)
   └──► image.service.ts (delete cropped on remove)

outfit.routes.ts
   ├──► outfit.service.ts (generateOutfitSuggestions, saveOutfit)
   ├──► database.service.ts
   └──► notification.service.ts (share notifications)

sharing.routes.ts
   └──► sharing.service.ts + notification.service.ts

subscription.routes.ts + webhook.routes.ts + payment.routes.ts
   └──► subscription.service.ts (all coin operations)

cron.routes.ts + daily-recommendations.routes.ts
   ├──► daily-recommendations.service.ts
   ├──► notification.service.ts
   └──► database.service.ts

avatar.routes.ts
   └──► avatar.service.ts
           ├──► gemini.ts (validation)
           └──► image.service.ts (crop + upload)

codes.routes.ts
   └──► referral.service.ts + subscription.service.ts (reward payouts)
```

## Long-lived singletons

- **`ai`** (Gemini SDK client) — `src/config/gemini.ts`. Reads `GEMINI_API_KEY` at boot.
- **`db`** (Drizzle) — `src/config/database.ts`. Connects to Supabase pooler (port 6543, `prepare: false`).
- **`cache`** — `src/config/cache.ts`. In-memory LRU.
- **`posthog`** — `src/utils/posthog.ts` — server-side event capture.
- **`costTracker`** — `src/utils/cost-tracker.ts` — logs per-call cost to PostHog under a shared trace ID.
- **Circuit breakers** — one per model, in `src/utils/circuit-breaker.ts`.

## Testing (or lack thereof)

There are no automated tests in this repo yet. Every change is verified by:
1. `npx tsc --noEmit`
2. Running the mobile dev build and reproducing the user path.
3. For SQL changes: applying via the Supabase MCP tool + reading affected rows.

Coverage plan: post-launch, prioritize `outfit.service.ts` scoring functions (pure, deterministic, easy to test) and `subscription.service.ts` (money — high-consequence).
