---
title: Starter wardrobe
sub: Persona pick + Home banner + read-only contract
---

Optional onboarding step (step 4 of 7) that seeds a curated 9-piece wardrobe into a new user's closet so they can explore outfit planning immediately. Also surfaces as a Home banner for existing users with fewer than 3 self-uploaded items.

## Personas + SKUs

Four personas, 9 SKUs each = 36 total:

- **Warm Neutrals** (female) — editorial earth tones
- **Bold Afrocentric** (female) — kente prints, statement pieces
- **Modern Professional** (male) — workwear, polished
- **Smart Casual Weekend** (male) — relaxed weekend uniform — **currently gated dark** pending the landing redeploy with the 37 asset files under `public/demo/{items,avatars,tryons}/smart-casual-weekend/`

Every persona has:
- 3 tops × 3 bottoms × 3 shoes (the 9-SKU shape is load-bearing — the mobile screen layout assumes it).
- 1 avatar photo (used as the "stand-in body" if the user opts in).
- 1 featured try-on image (used as the persona-preview hero image).

Catalog source: `ch-backend-main/src/data/starter-wardrobe.ts`. DB seed: `starter_clothing_skus` table (populated via `scripts/seed-starter-skus.ts`).

## Backend endpoints

- `GET /wardrobe/starter-personas` — gender-filtered, geo-aware (Ghana IPs see Bold Afrocentric first).
- `POST /wardrobe/seed-starter` — rate-limited 5/hour. Transactional claim with `starter_wardrobe_seeded_at IS NULL`.
- `DELETE /wardrobe/starter` — bulk-removes with outfit-slot annotation, empty-outfit cleanup, dismissed-outfit cleanup.
- `GET /wardrobe/starter/impact` — pre-delete preview: how many outfits will lose slots or be deleted entirely.
- `POST /wardrobe/starter/dismiss-banner` — permanently dismiss the Home banner.

## Defense-in-depth (three layers)

**Layer 1 — RLS on `clothing_items`.** INSERT/UPDATE `WITH CHECK` requires `source='user' AND starter_sku_id IS NULL`. DELETE `USING` requires `source='user'`. Blocks direct PostgREST mutations from mobile clients.

**Layer 2 — Trigger on `profiles`.** `guard_profile_starter_columns` raises `42501` when an authenticated role tries to change any of the four `starter_*` columns. Backend service role bypasses via `current_user IN ('postgres', 'service_role')` check.

**Layer 3 — App-layer `STARTER_READ_ONLY` 403 guards** on 8 mutation endpoints: PATCH `/wardrobe/:id`, DELETE `/:id`, POST `/:id/reextract`, PATCH `/:id/archive`, PATCH `/:id/unarchive`, POST `/:id/replace`, POST `/:id/unlink-set`, POST `/sets`.

Why three layers? Each catches a different attack class:
- RLS catches direct-Supabase mutations from a compromised mobile client.
- Trigger catches profile-column tampering.
- App-layer catches backend service code that would otherwise write through the postgres-role bypass — like `/reextract` deleting the shared cropped URL.

## Home banner

`components/StarterBanner.tsx`. Gated on:

- Profile is loaded.
- `starter_persona_id IS NULL` (user hasn't picked before).
- `starter_banner_dismissed_at IS NULL` (user hasn't dismissed).
- User has fewer than 3 self-uploaded items.

"Try a set" routes to `/onboarding/starter-wardrobe?from=home`. That param triggers the re-entry mode: no ProgressBar, "Done" not "Continue", `setAvatarUrl` skipped, `trackOnboardingStepCompleted` skipped, `goNext` does `router.back()`.

"Not now" / X → `useDismissStarterBanner` fires with cancelQueries + optimistic stamp + onError toast + rollback. Banner hides instantly.

## Analytics (16 events)

**Funnel (11)** — all carry `entered_from: 'onboarding' | 'home'`:
- `starter_personas_loaded`, `starter_screen_viewed`, `starter_persona_offered`, `starter_persona_previewed`, `starter_persona_preview_dismissed`, `starter_persona_chosen`, `starter_persona_chosen_failed`, `starter_skipped`, `starter_screen_exited`, `starter_already_seeded_viewed`, `starter_already_seeded_continued`.

**Activation (2)** — with `persona_id`:
- `outfit_planned_with_starter`, `outfit_tryon_with_starter`. Fires after save succeeds.

**Banner (3)**:
- `starter_banner_shown` (once per mount), `starter_banner_cta_tapped`, `starter_banner_dismissed` with `dismiss_source: 'not_now' | 'x'`.

Ordering rule (load-bearing): `trackOnboardingStepCompleted` fires **before** `trackStarterPersonaChosen`. Reversing it makes the funnel report ~0% conversion.

## Files you'd touch

| Concern | File |
|---|---|
| Catalog (taxonomy) | `ch-backend-main/src/data/starter-wardrobe.ts` |
| Routes | `ch-backend-main/src/routes/wardrobe.routes.ts` |
| Migration | `ch-backend-main/supabase/migrations/003_starter_wardrobe.sql` |
| Seed script | `ch-backend-main/scripts/seed-starter-skus.ts` |
| Onboarding screen | `closet-heritage-app/app/onboarding/starter-wardrobe.tsx` |
| Home banner | `closet-heritage-app/components/StarterBanner.tsx` |
| Hooks | `closet-heritage-app/hooks/useStarterWardrobe.ts` |
| Runbook — unlock SCW | See **[Runbooks / Unlock Smart Casual Weekend](/control/docs/runbooks/unlock-scw)** |
