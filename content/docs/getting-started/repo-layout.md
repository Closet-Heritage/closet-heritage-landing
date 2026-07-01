---
title: Repo layout
sub: Three repos, what each contains
---

## `closet-heritage-app/` — mobile

**Stack**: Expo SDK 54 · React Native 0.81 · React 19 · TypeScript · NativeWind (Tailwind for RN) · Zustand · React Query · Expo Router v6.

```
closet-heritage-app/
├── app/                    # Expo Router — every folder is a route
│   ├── (auth)/             # sign-in screens (route group)
│   ├── (tabs)/             # main tab screens (home, wardrobe, outfits, profile, add)
│   ├── onboarding/         # 7-step signup flow
│   ├── plan-outfit/        # outfit generator + results
│   ├── wardrobe/           # item detail, set detail
│   ├── shared/             # public shared outfit view
│   ├── manage-subscription.tsx
│   ├── paywall.tsx
│   └── _layout.tsx         # root providers + auth listener
├── components/             # reusable UI (theme-aware, NativeWind)
├── hooks/                  # useAuth, useWardrobe, useOutfits, useTryOn, useProfile, useStarterWardrobe…
├── stores/                 # auth.store, onboarding.store, outfit-planning.store, outfit-navigation.store
├── lib/                    # api client, analytics, colors, safe-navigation, in-app-browser, error mapping
├── types/                  # wardrobe, outfit, api response types (mirror backend)
└── assets/                 # icons, images, fonts, iOS Notification Service Extension
```

Detailed maps: **[Screen map](/control/docs/mobile/screens)** · **[Hooks](/control/docs/mobile/hooks)** · **[Stores](/control/docs/mobile/state)**

## `ch-backend-main/` — backend

**Stack**: Node 20 · Fastify 5 · Drizzle ORM · TypeScript · deployed on Railway.

```
ch-backend-main/
├── src/
│   ├── app.ts              # Fastify bootstrap + route registration
│   ├── routes/             # HTTP endpoints — one file per resource
│   ├── services/           # business logic — outfit.service, virtual-tryon.service, subscription.service…
│   ├── db/                 # Drizzle schema + connection
│   ├── config/             # env, Gemini, cache, database
│   ├── schemas/            # zod input validation
│   ├── utils/              # taxonomy, prompts, color-matching, vibe-filters, circuit-breaker…
│   ├── middleware/         # authenticate, aiConsentGuard, ratelimit
│   ├── data/               # static seed data (starter-wardrobe SKUs)
│   └── types/              # shared types
├── drizzle/                # generated migrations from schema.ts
├── supabase/migrations/    # hand-authored SQL migrations (RLS, triggers, seed)
├── scripts/                # one-off tools (generate-demo-assets, seed-starter-skus)
└── docs/                   # architecture + runbooks — mirrored here in /control/docs
```

Detailed maps: **[Route reference](/control/docs/backend/routes)** · **[Services](/control/docs/backend/services)** · **[Database schema](/control/docs/backend/database)**

## `closet-heritage-landing/` — this repo

**Stack**: Next.js 16 App Router · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Supabase JS.

```
closet-heritage-landing/
├── app/
│   ├── page.tsx            # public landing page (marketing)
│   ├── delete-account/     # in-app deletion form (required by App Store)
│   ├── invite/             # ambassador / gift code redemption landing
│   ├── privacy/            # privacy policy
│   ├── api/                # Paystack webhook, HMAC-signed checkout token endpoint
│   └── control/            # ← THIS: the ops panel + this documentation
├── components/             # shared UI (landing + control share button, card patterns)
├── content/docs/           # markdown source of every doc page you're reading
├── lib/                    # supabase (public + admin), utils, control-auth
├── scripts/                # sync-docs
└── middleware.ts           # gates /control/*
```

## What lives where — quick lookup

| Concern | Repo | Path |
|---|---|---|
| Wardrobe photo upload | mobile → backend | `hooks/useBatchProcessing.ts` → `src/routes/ai.routes.ts` |
| Wardrobe AI pipeline | backend | `src/services/workflow.service.ts` + `grid-generation.service.ts` + `tagging.service.ts` |
| Outfit generation | backend | `src/services/outfit.service.ts` |
| Virtual try-on | backend | `src/services/virtual-tryon.service.ts` |
| Auth / social sign-in | mobile | `hooks/useAuth.ts`, `lib/supabase.ts` |
| Payments (mobile) | mobile | RevenueCat SDK + `hooks/useSubscription.ts` |
| Payments (web) | landing + backend | `closet-heritage-landing/app/subscribe/page.tsx` (Paystack checkout UI) + `ch-backend-main/src/routes/webhook.routes.ts` (POST `/webhooks/paystack`) |
| Starter wardrobe | both | `src/data/starter-wardrobe.ts` + `app/onboarding/starter-wardrobe.tsx` |
| Push notifications | mobile + backend | `hooks/usePushNotifications.ts` + `src/services/notification.service.ts` |
| Cron jobs | backend | `src/routes/cron.routes.ts` triggered by Railway cron |
| Content moderation | backend | `src/utils/content-filter.ts` |
