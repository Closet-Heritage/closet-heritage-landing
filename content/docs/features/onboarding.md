---
title: Onboarding
sub: The 7-step signup flow
---

Onboarding runs immediately after a new user signs in and before they can access the tab bar. Each step writes to `stores/onboarding.store.ts`; the last step (`wash-frequency`) POSTs everything to `profiles` in one `UPDATE`.

## The 7 steps

| # | Route | Data captured | Notes |
|---|---|---|---|
| 1 | `/onboarding/name` | `full_name` | Text input. |
| 2 | `/onboarding/referral-code` | none (side-effect: redeems code) | Optional. Reads `pendingCode` from AsyncStorage if the user came from a deep link. Does **not** fire `trackOnboardingStepCompleted` (not counted in the funnel). |
| 3 | `/onboarding/gender` | `gender` (`'male' \| 'female'`) | Drives starter persona filter + outfit generator's `gender` prompt param. Type does not include non-binary — add to the union + UI if that changes. |
| 4 | `/onboarding/starter-wardrobe` | `starter_persona_id`, optionally `starter_avatar_persona_id` and `avatar_url` | See **[Starter wardrobe](/control/docs/features/starter-wardrobe)**. |
| 5 | `/onboarding/ai-consent` | `ai_consent_at` | Required by App Store Guideline 5.1.2(i). Set to `NOW()` on accept. Backend AI routes 403 without this. |
| 6 | `/onboarding/photo-guide` | none (routes to avatar-capture) | Shows a diagram of good/bad avatar photos. Skips this + step 6a if the user already picked a stand-in avatar in step 4. |
| 6a | `/onboarding/avatar-capture` | `avatar_url` | Camera + validate via Gemini + upload. Also entered later from Profile with `?from=profile`. |
| 7 | `/onboarding/wash-frequency` | `wash_frequency` | Every wear / 2-3 wears / weekly / only when needed. Feeds the recently-worn outfit filter. |
| — | `/onboarding/welcome-trial` | none | Announces the 30-coin trial. Modal-style. Deposits trial coins via RevenueCat V2 API. |

## Where the persistence happens

Every step writes to Zustand *only*. The single `saveProfile()` callback (from `hooks/useOnboarding.ts`, wrapping `useUpdateProfile`) fires from `wash-frequency`. This means:

- Backing out mid-flow leaves no server rows.
- The store is reset on `SIGNED_OUT` and account-switch.
- `saveProfile` uses function-form `setQueryData` so `starter_*` fields written by the step-4 seed aren't clobbered when the final UPDATE lands.

## Step counter contract

Every screen renders `<ProgressBar currentStep={N} totalSteps={7} />`. If you add or remove a step:

1. Bump `TOTAL_STEPS` in every screen file.
2. Shift `currentStep` values on screens after the insert point.
3. Delete or repurpose `useOnboardingStore.currentStep` — it's currently dead state (nothing reads it back).

## Analytics on this flow

Every counted screen fires `trackOnboardingStepCompleted(step)` in its "Continue" handler. `referral-code` is excluded (see step 2 note). The step names in the union: `name | gender | starter_wardrobe | ai_consent | photo_guide | avatar | wash_frequency`.

Funnel to build in PostHog:

```
sign_up_completed
  → onboarding_step_completed(name)
    → onboarding_step_completed(gender)
      → onboarding_step_completed(starter_wardrobe)
        → onboarding_completed
```

Where the funnel narrows tells you where users bail. Historic drop-off point: step 3→4 (gender → starter). Solutions have been iterated in the R-C review sessions.

## Starter wardrobe skip vs pick paths

**Pick path** — user picks a persona → 9 items seeded → onboarding continues to ai-consent → photo-guide → if `also_use_avatar=true`, photo-guide skips into "looking good, continue" instead of "take a photo".

**Skip path** — user taps "I'll add my own clothes" → straight to ai-consent → photo-guide requires an avatar.

Both paths land on wash-frequency then welcome-trial then the tab bar.

## Home banner re-entry

An existing user with fewer than 3 self-uploaded items sees a `StarterBanner` on Home offering to try a starter set. Tapping it routes to `/onboarding/starter-wardrobe?from=home` — the same screen but with a param. In that mode:

- ProgressBar is hidden.
- CTA labels change ("Done" instead of "Continue").
- `setAvatarUrl` and `trackOnboardingStepCompleted` are skipped (this is not an onboarding event).
- Success/skip does `router.back()` instead of forward-navigating.

## iOS gesture on starter-wardrobe

`Stack.Screen name="starter-wardrobe" options={{ gestureEnabled: false }}` — edge-swipe during an in-flight seed mutation would orphan the mutation and can clobber a stand-in avatar. See adversarial review R-Launch for the full incident report.
