---
title: What Closet Heritage is
sub: A five-minute orientation for a new engineer
---

**Closet Heritage** is a mobile app for Ghana-first (and eventually pan-African + diaspora) fashion. Users photograph their clothes, the app tags every piece with AI, then suggests outfits, generates virtual try-ons, and lets users plan a week of looks at a time.

## The core loop

1. **User uploads a photo of clothes** on a bed or hanging in a closet.
2. **Backend runs an AI pipeline** (Google Gemini) that validates the photo, isolates each item, tags color/pattern/style/season/occasion, and background-removes each item.
3. **Items land in the user's wardrobe** as individual, taggable pieces.
4. **User taps "Suggest"** and picks filters (occasion, weather, vibe).
5. **Backend runs a deterministic algorithm** (no AI) that picks the best combinations from what they own.
6. **User picks a favourite and taps "Try On"** — Gemini renders them wearing the outfit.
7. **Repeat**, or save the outfit to a specific day.

The product's superpower is that it works for African clothing (kente, agbada, boubou, dashiki, ankara prints) — every taxonomy, prompt, and vibe filter was built with that in mind.

## Business model

- **Subscription** — Trial (30 coins/mo) → Standard ($3.99, 50 coins) → Premium ($5.99, 100 coins). Coin packs sold separately.
- **Coins gate expensive AI** — try-on is 5 coins, outfit-planning session is 1 coin. Everything else is free.
- **Payments** — Apple / Google IAP via **RevenueCat**. Web / Ghana MoMo via **Paystack**.

## Team, launch state, users

- **Team**: 2 (CEO + CTO).
- **State**: implementation complete, adversarially audited, pre-App-Store submission.
- **Users**: a handful of testers; hundreds of testable events via TestFlight.

## Where to start reading

If you're new, follow this order:
1. **[Local setup](/control/docs/getting-started/local-setup)** — get the code running on your machine.
2. **[Repo layout](/control/docs/getting-started/repo-layout)** — 3 repos, what each contains.
3. **[System overview](/control/docs/architecture/system-overview)** — how mobile, backend, and Supabase talk.
4. **[Data model](/control/docs/architecture/data-model)** — every table and how they relate.
5. Then pick a feature (**[Wardrobe + AI](/control/docs/features/wardrobe-ai)** and **[Virtual try-on](/control/docs/features/virtual-tryon)** are the flagship ones).

## What's *not* in this app

Worth knowing so you don't look for it:

- **No web version of the main app.** The landing site + `/control` (this) + the paywall-checkout page are the only web surfaces. The product is mobile-only.
- **No custom ML models.** All AI is Google Gemini via API. No fine-tuning, no self-hosted inference.
- **No user-to-user messaging.** There's outfit sharing + comments, but no DMs.
- **No push-based social feed.** No "For You" tab. Sharing is opt-in per outfit.
