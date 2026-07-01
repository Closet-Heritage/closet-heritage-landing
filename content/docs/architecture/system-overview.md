---
title: System overview
sub: How the pieces talk to each other
---

## The wire diagram

```
                            ┌────────────────────────┐
                            │  Google Gemini API     │
                            │  (image + text + vision)│
                            └───────────▲────────────┘
                                        │
                                        │ HTTPS
                                        │
       ┌─────────────────┐    HTTPS     ▼      HTTPS    ┌─────────────────┐
       │  Mobile app     │──────────► Backend ◄────────│  Landing site   │
       │  (Expo iOS+Andr)│   REST    (Fastify/Railway) │  (Next.js/Vercel)│
       └────────▲────────┘                             └────────▲────────┘
                │                                              │
                │ Supabase JS (RLS)                            │ Supabase JS (RLS)
                │                                              │ + service role (control)
                ▼                                              ▼
       ┌──────────────────────────────────────────────────────────────┐
       │                    Supabase (PostgreSQL)                     │
       │  Auth users · profiles · clothing_items · outfits · payments │
       │  Storage: clothing-images bucket (originals, cropped, tryons)│
       └──────────────────────────────────────────────────────────────┘
                │
                │ Realtime (Postgres Changes)
                ▼
       ┌────────────────┐
       │  Mobile app    │  ← comment notifications, outfit reactions
       │  (subscribed)  │
       └────────────────┘

              ┌───────────┐         ┌──────────┐         ┌──────────┐
              │ Paystack  │         │RevenueCat│         │ PostHog  │
              │ (Ghana)   │◄────────│          │◄────────│          │
              │ webhooks  │  mobile │  mobile  │  events │  mobile  │
              └─────▲─────┘   IAP   └────▲─────┘         │+ backend │
                    │                     │              └──────────┘
                    │ webhook              │
              ┌─────┴─────┐               │
              │  Backend  │◄──────────────┘
              │  (webhook │  entitlement grants / cancellations
              │   handler)│
              └───────────┘
```

## Who talks to whom (and how)

| From → To | Protocol | Purpose |
|---|---|---|
| Mobile → Supabase | Supabase JS (JWT-authenticated) | Auth, direct table reads/writes gated by RLS |
| Mobile → Backend | HTTPS + Bearer JWT | AI-heavy work: wardrobe processing, outfit generation, try-on, sharing, subscription checks |
| Mobile → RevenueCat | RC SDK | IAP purchases, entitlement checks, coin balance |
| Backend → Supabase | Postgres direct (service role) | Bypasses RLS for admin operations (seed, refund, moderation) |
| Backend → Gemini | HTTPS | Image validation, tagging, grid generation, try-on, chat |
| Backend → RevenueCat | REST | Coin debit/credit via Virtual Currency V2 API |
| Paystack → Backend | HTTPS webhook | Success + failure notifications for MoMo/card |
| RevenueCat → Backend | HTTPS webhook | Subscription lifecycle events (INITIAL_PURCHASE, RENEWAL, CANCELLATION, REFUND, ...) |
| Backend → Supabase Realtime | Postgres NOTIFY | Comment insertion triggers Realtime broadcast |
| Supabase Realtime → Mobile | WebSocket | Push comment/reaction updates to subscribed clients |
| Mobile → PostHog | HTTPS | Analytics events + session replay |
| Backend → PostHog | HTTPS (posthog-node) | Server-side events (AI errors, subscription changes) |
| Landing/control → Supabase | Supabase JS (service role) | Admin panel reads |

## Auth in one sentence

Supabase Auth issues a JWT to the mobile app on sign-in; the app sends it as `Authorization: Bearer <jwt>` on every backend call; backend `authenticate` middleware validates the JWT against Supabase's JWKS and populates `request.user`. Details in **[Auth flow](/control/docs/architecture/auth-flow)**.

## Data flow: uploading a photo

```
User taps camera
   ↓
[MOBILE] compress + resize to 2048px width, quality 1.0
   ↓
Supabase Storage upload (originals/<userId>/<batchId>.jpg)
   ↓
[MOBILE] POST /api/v1/ai/tag-clothing { batchId, urls, gender }
   ↓
[BACKEND] enqueue photo-batch job in Postgres (batchId, status='processing')
   ↓
   loop per photo:
     • Gemini 3 Flash Preview validate photo   ← reject if not clothes
     • Gemini 3.1 Flash Image generate grid
     • Gemini 3 Flash Preview tag each item
     • crop items from grid
     • Gemini 3 Flash Preview verify crops (hallucination guard)
     • re-extract failed items (dual reference: original + grid)
     • Gemini 2.5 Flash text compare re-extracted vs grid crop
     • @imgly/background-removal on final crops
     • upload cropped images to Supabase Storage
     • INSERT rows into clothing_items (with source='user', starter_sku_id=NULL)
   ↓
[BACKEND] Update batch row: status='completed', items_detected=N
   ↓
[MOBILE] Poll GET /api/v1/batches/:batchId/status every 3s → see status=completed
   ↓
User sees new items in Wardrobe tab
```

See **[Wardrobe + AI pipeline](/control/docs/features/wardrobe-ai)** for the full walk-through with prompts and cost per stage.

## Data flow: generating an outfit

Pure algorithm — no AI calls, no cost. See **[Outfit matching](/control/docs/features/outfit-matching)** for the complete algorithm (color harmony, vibe scoring, dismissed subsets, matching-set bonus).

## Data flow: virtual try-on

Gemini image gen with hedged fallback + background removal. See **[Virtual try-on](/control/docs/features/virtual-tryon)** for the complete algorithm.
