---
title: Screen map
sub: Every route in the mobile app
---

Cross-checked against `closet-heritage-app/app/` as of 2026-07.

## Sign-in stack — `app/(auth)/`

| Route | File | Purpose |
|---|---|---|
| `/intro` | `intro.tsx` | Splash / value-prop carousel |
| `/auth-landing` | `auth-landing.tsx` | Sign-in method chooser (Google, Apple, Email). Contains the terms checkbox. |
| `/login` | `login.tsx` | Email + password |
| `/signup` | `signup.tsx` | Email + password + terms confirm |
| `/verify-email` | `verify-email.tsx` | 6-digit magic-link code entry |
| `/reset-password` | `reset-password.tsx` | Send reset email |
| `/new-password` | `new-password.tsx` | Set new password after reset |

## Onboarding stack — `app/onboarding/`

7 visible steps tracked by `ProgressBar`. Order:

| # | Route | File | Purpose |
|---|---|---|---|
| 1 | `/onboarding/name` | `name.tsx` | Full name |
| 2 | `/onboarding/referral-code` | `referral-code.tsx` | Optional promo/ambassador code. Reads `pendingCode` from AsyncStorage. Does **not** fire `trackOnboardingStepCompleted` (this screen is not counted in the funnel). |
| 3 | `/onboarding/gender` | `gender.tsx` | `'male' \| 'female'` (no non-binary in the type currently) |
| 4 | `/onboarding/starter-wardrobe` | `starter-wardrobe.tsx` | Persona pick or skip. Also reachable from Home with `?from=home`. |
| 5 | `/onboarding/ai-consent` | `ai-consent.tsx` | Sets `ai_consent_at`. Required for AI endpoints. |
| 6 | `/onboarding/photo-guide` | `photo-guide.tsx` | Good/bad avatar photo diagram. Skips ahead if user already has an avatar from a stand-in. |
| 6a | `/onboarding/avatar-capture` | `avatar-capture.tsx` | Camera → validate → upload. Reachable from Profile with `?from=profile`. |
| 7 | `/onboarding/wash-frequency` | `wash-frequency.tsx` | Every wear / 2-3 wears / weekly / only when needed. |
| — | `/onboarding/welcome-trial` | `welcome-trial.tsx` | Trial announcement — 30 coins, subscription upsell. |

## Main tabs — `app/(tabs)/`

| Tab | Route | File | Purpose |
|---|---|---|---|
| **Home** | `/` | `index.tsx` | Greeting, plan-outfit CTA, TodayPicksPill, StarterBanner, recent items, planned outfits |
| **Wardrobe** | `/wardrobe` | `wardrobe.tsx` | Grid of items with category chips, filters, bulk-select mode |
| **Add** | `/add` | `add.tsx` (placeholder) | Tab press is intercepted in `(tabs)/_layout.tsx` and opens `ActionBottomSheet`. The sheet routes to `/capture` (upload flow) or `/plan-outfit`. The `add.tsx` file exists only so the tab renders. |
| **Outfits** | `/outfits` | `outfits.tsx` | Calendar + list views of saved outfits. Detail opens in-place via `setFocusOutfitId` — there is no separate `/planned-outfits/[id]` route. |
| **Profile** | `/profile` | `profile.tsx` | User info + subscription + settings + logout + delete account |

## Root-level standalone screens — `app/`

| Route | File | Purpose |
|---|---|---|
| `/manage-subscription` | `manage-subscription.tsx` | Membership hub — plan card, coin balance, purchase packs, cancel |
| `/paywall` | `paywall.tsx` | Single-screen Apple-2026-style pricing page. Modal presentation. Wraps its own BottomSheetModalProvider + Toast (see gotcha docs). |
| `/notification-settings` | `notification-settings.tsx` | Push toggles + daily-rec hour |
| `/contact-us` | `contact-us.tsx` | Support form → landing site's `/api/contact` |
| `/delete-account` | `delete-account.tsx` | Confirm + reason → `DELETE /api/v1/account` |
| `/faqs` | `faqs.tsx` | Static FAQ list |
| `/redeem-code` | `redeem-code.tsx` | Standalone code redemption UI. Also `POST /api/v1/codes/redeem`. |
| `/dismissed-outfits` | `dismissed-outfits.tsx` | View + restore combos the user swiped away |
| `/invite-friends` | `invite-friends.tsx` | Ambassador share page for the user's own code |
| `/capture` | `capture/index.tsx` | Camera surface used by both wardrobe upload and avatar capture |
| `/add-item/processing` | `add-item/processing.tsx` | Post-capture AI screen while the batch is running |
| `/invite/[code]` | `invite/[code].tsx` | Ambassador deep-link handler when the app is opened from an invite link |

## Plan-outfit flow — `app/plan-outfit/`

| Route | Purpose |
|---|---|
| `/plan-outfit` | Filter picker — occasion, weather, vibe, colors, duration, layers |
| `/plan-outfit/results` | Swipeable carousel of generated suggestions. Try-on button per suggestion. "Done" saves everything. |

## Wardrobe detail — `app/wardrobe/`

| Route | Purpose |
|---|---|
| `/wardrobe/[itemId]` | Item detail — tags, edit fields, matching set link, archive/delete |
| `/wardrobe/set/[setId]` | Matching set detail |

## Sharing — `app/shared/`

| Route | Purpose |
|---|---|
| `/shared/[shareCode]` | Public read-only view of a shared outfit. Deep-linkable. Comments + thumbs. |

## Route group notes

- `(auth)` — sign-in stack. No tab bar visible.
- `(tabs)` — main tab layout using `<Tabs>` component.
- `onboarding/` — no route-group parens; has its own `_layout.tsx` disabling `gestureEnabled` on `starter-wardrobe` to prevent edge-swipe orphaning the seed mutation.

## When to reach for a modal vs push navigation

- **Modal** (`presentation: 'modal'`): paywall, edit-outfit sheet, sharing sheet.
- **Push**: item detail, wardrobe filter pages, sub-flows.

Modal screens on iOS render outside the app's root Toast/BottomSheet providers and **must** wrap themselves. See `gotcha_ios_modal_screens.md` in auto-memory.
