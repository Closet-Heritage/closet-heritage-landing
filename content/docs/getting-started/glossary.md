---
title: Glossary
sub: Terms used across the codebase
---

Alphabetical. Where a term has a specific technical meaning inside this codebase, that's the definition given.

| Term | Meaning |
|---|---|
| **Anchor item** | An item the user has pinned so it appears in every generated outfit. |
| **Ambassador** | A user with an approved ambassador application; earns coins when their code is redeemed. |
| **Avatar** | The user's full-body photo used as the "body" in try-on. Not their profile picture — that's on their `auth.users` metadata. |
| **Batch** | A grouped upload of one or more photos; kicks off the AI pipeline. Row in `upload_batches`. |
| **Coin** | The in-app currency. 5 coins per try-on, 1 coin per outfit-planning session. |
| **Combination** | A specific outfit shape considered by the matcher — e.g. {top #3, bottom #7, shoes #2}. |
| **CTA** | Call-to-action. Usually a primary button in a bottom sheet. |
| **Curated set** | Same as **matching set**. A manually linked group of items the user considers a coordinated look. |
| **Daily rec** | A push notification sent at the user's chosen hour recommending a saved outfit for today. |
| **Dismissed outfit** | A combination the user swiped away in the suggestion carousel. Blocked from re-appearing. Row in `dismissed_outfits`. |
| **Dress family** | Outfit shape without separates — a single dress or full outfit (kaftan, boubou, agbada). |
| **Family (occasion)** | A group of related occasions (formal, smart-casual, active, comfort). |
| **Gift code** | A one-shot code that grants a subscription plan. Row in `promo_codes` with `type='gift'`. |
| **Grid** | A composite image the AI generates during wardrobe upload that shows every detected item on a clean background — used for cropping and verification. |
| **Hedged request** | Firing a backup AI call in parallel after a delay in case the primary is slow. See virtual try-on doc. |
| **Item** | A single piece of clothing in a user's wardrobe. Row in `clothing_items`. |
| **Matching set** | Items the user manually linked as "these go together". Scoring gives them a big bonus. |
| **Outfit** | A saved combination — one or more items linked as a look, optionally with a planned date. Row in `outfits`. |
| **Persona** | One of four curated starter-wardrobe sets: Warm Neutrals, Bold Afrocentric, Modern Professional, Smart Casual Weekend. |
| **Plan** | (a) subscription tier: Trial / Standard / Premium; (b) verb — the user is "planning outfits" when using `/plan-outfit`. |
| **Promo code** | Umbrella term for referral / ambassador / gift codes. Row in `promo_codes`. |
| **Re-engagement tier** | 0–3 integer on `profiles`, driven by days-since-last-active. Backend uses it to decide which push notification copy to send. |
| **Separates** | Outfit shape with a top + bottom + optional shoes (as opposed to a dress). |
| **Session** | (a) auth session (Supabase); (b) planning session — one round of "Suggest" through "Save" (charged 1 coin at the end). |
| **Set** | See **matching set**. |
| **Shared outfit** | An outfit made public via a share code. Row in `shared_outfits`. |
| **Slot** | One of the six positions in an outfit: top / bottom / shoes / dress / outerwear / accessory. |
| **SKU (starter)** | One of the 36 curated pieces in `starter_clothing_skus`. Not the same as a subscription SKU. |
| **Stand-in avatar** | A persona's featured model image copied into `profiles.avatar_url` when the user picks "use as my try-on model" during starter pick. |
| **Starter wardrobe** | A curated 9-piece set seeded into a new user's wardrobe if they pick a persona. Feature-flagged by persona. |
| **Style label** | A one-word tag the color matcher assigns to an outfit — Classic, Bold, Fresh, Warm, etc. Shown on the outfit card. |
| **Subcategory** | Fine-grained item type from `taxonomy.ts` — Oxford Shirt, Chinos, Suede Loafers. |
| **Top category** | Coarse item type from `taxonomy.ts` — Clothing, Footwear, Accessories, Bags. |
| **Try-on** | The Gemini-generated image of the user wearing an outfit. Row on `outfits.tryon_image_url`. |
| **Vibe** | User-selected aesthetic filter — Classic, Afrocentric, Bold, Relaxed, Minimalist, Any. |
| **Wardrobe** | The user's collection of items. |
