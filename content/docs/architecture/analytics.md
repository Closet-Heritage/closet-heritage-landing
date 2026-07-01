---
title: Analytics
sub: PostHog events, funnels, session replay
---

## Two SDKs, one project

- **Mobile** — `posthog-react-native` + `posthog-react-native-session-replay`. Config in `lib/posthog-client.ts`. Env: `EXPO_PUBLIC_POSTHOG_API_KEY`.
- **Backend** — `posthog-node` singleton in `src/utils/posthog.ts`. Env: `POSTHOG_API_KEY` (optional; safe to omit — server-side events are nice-to-have).

Both feed the same PostHog project. Identify happens on `SIGNED_IN` — `posthog.identify(userId, { email, name, sign_in_method })`. Session replay: 10% sampling in production, text inputs masked.

## Screen tracking

`captureScreens` is broken with Expo Router, so we do manual: `hooks/useScreenTracking.ts` fires `$pageview` with `screen` = `usePathname()`.

## Where events fire — typed helpers in `lib/analytics.ts`

Every event is defined as a helper function so `posthog.capture` is never called with a raw string. This gives autocomplete + one-place-to-audit-all-events.

## Event catalog (as of Session 15)

**Auth & onboarding**
- `auth_method_chosen` (method)
- `sign_up_completed` (method)
- `onboarding_step_completed` (step) — fired at end of every onboarding screen
- `onboarding_completed` — fired after wash-frequency

**Wardrobe pipeline**
- `batch_started` (batch_id, photo_count)
- `batch_completed` (batch_id, items_detected, rejected_photos)
- `batch_failed` (batch_id, error)
- `item_deleted`, `item_archived`, `item_edited`

**Outfits**
- `outfit_generated` (count, occasion, weather, vibe)
- `outfit_saved` (planned_date, items_count)
- `outfit_dismissed` (item_ids)
- `outfit_shared` (share_code)

**Try-on**
- `tryon_started`
- `tryon_completed` (tryons_remaining, ms)
- `tryon_failed` (error)

**Payments**
- `paywall_shown` (source)
- `plan_selected` (plan, provider)
- `subscription_activated` (plan, provider)
- `subscription_cancelled`
- `refund_processed`

**Starter wardrobe** (11 funnel + 2 activation + 3 banner events, all carry `entered_from: 'onboarding' | 'home'`)
- `starter_personas_loaded`
- `starter_screen_viewed`
- `starter_persona_offered`
- `starter_persona_previewed`
- `starter_persona_preview_dismissed`
- `starter_persona_chosen`
- `starter_persona_chosen_failed`
- `starter_skipped`
- `starter_screen_exited`
- `starter_already_seeded_viewed`
- `starter_already_seeded_continued`
- `outfit_planned_with_starter` (persona_id, starter_item_count)
- `outfit_tryon_with_starter` (persona_id)
- `starter_banner_shown`
- `starter_banner_cta_tapped`
- `starter_banner_dismissed` (dismiss_source: 'not_now' | 'x')

## Recommended funnels

**Signup activation funnel:**
```
sign_up_completed
  → onboarding_step_completed(starter_wardrobe)
    → starter_persona_chosen | starter_skipped
      → batch_completed | (skip - starter path)
        → outfit_generated
          → outfit_saved
            → tryon_completed
              → subscription_activated
```

**Starter cohort funnel** (segment by `entered_from`):
```
starter_persona_chosen
  → outfit_planned_with_starter
    → outfit_tryon_with_starter
```

Comparing `entered_from = onboarding` vs `entered_from = home` shows whether the banner cohort activates at the same rate as first-time pickers.

## Ordering rules — important

PostHog funnels chain in event-firing order. Two rules that must not change:

1. `trackOnboardingStepCompleted` fires **before** `trackStarterPersonaChosen` in `handleConfirm`. Reversing it makes the funnel report ~0% conversion.
2. `trackOutfitPlannedWithStarter` fires **after** the save mutation awaits successfully. Otherwise it fires for outfits that were never saved.

## Session replay masking

`AvatarViewer` and `PersonaPreview` images are marked `ph-no-capture` because they contain full-body user photos we don't want to record. Clothing item images stay visible — they're not sensitive.

## Cost + rate

PostHog free tier: 1M events/month. At scale we'll cross that with session replay on; adjust sampling in `lib/posthog-client.ts`.
