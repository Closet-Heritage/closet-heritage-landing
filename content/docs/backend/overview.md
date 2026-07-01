---
title: Backend overview
sub: Fastify + Drizzle layout
---

## Stack

- **Runtime**: Node 20+
- **Framework**: Fastify 5
- **ORM**: Drizzle
- **DB**: Postgres (Supabase)
- **Deploy**: Railway (auto-deploy on push to `main`)
- **Language**: TypeScript strict mode
- **Logs**: pino → Railway logs

## Folder map

```
ch-backend-main/src/
├── app.ts                 # Fastify bootstrap, plugin registration, route mount
├── config/
│   ├── env.ts             # zod-validated env schema — single source of truth
│   ├── database.ts        # Drizzle client (postgres.js, prepare:false for pooler)
│   ├── gemini.ts          # Gemini SDK setup + MODELS constants + TRYON_CONFIG
│   └── cache.ts           # in-memory LRU cache keyed by userId
├── routes/                # HTTP endpoints — one file per resource
│   ├── ai.routes.ts       # /ai/process-batch, /ai/virtual-tryon (+ AI consent guard)
│   ├── wardrobe.routes.ts # /wardrobe/* CRUD + starter + sets + replace
│   ├── outfit.routes.ts   # /outfits/* generate + save + share
│   ├── subscription.routes.ts
│   ├── payment.routes.ts  # Paystack webhook + web checkout token
│   ├── webhook.routes.ts  # RevenueCat webhook
│   ├── notification.routes.ts # register push token
│   ├── cron.routes.ts     # daily-recs, re-engagement, reap-stuck-txns (called by Railway cron)
│   ├── comment.routes.ts  # /comments + moderation
│   ├── shared.routes.ts   # /shared/:shareCode public read
│   ├── codes.routes.ts    # promo code redemption
│   ├── avatar.routes.ts   # avatar upload + validate + SSRF-guarded
│   ├── account.routes.ts  # delete-account
│   └── contact.routes.ts  # support inbox
├── services/              # business logic — no HTTP concerns
│   ├── outfit.service.ts          # 2,500 lines — the outfit matcher
│   ├── virtual-tryon.service.ts   # try-on pipeline with hedged Gemini
│   ├── photo-batch.service.ts     # multi-photo AI processing
│   ├── tagging.service.ts         # per-item Gemini tagging
│   ├── background-removal.service.ts
│   ├── image.service.ts           # fetch, compress, upload
│   ├── subscription.service.ts    # coin economy + RC V2 API
│   ├── notification.service.ts    # Expo push
│   ├── avatar.service.ts          # Gemini validation + crop
│   ├── virtual-tryon.service.ts
│   ├── outfit.service.ts
│   ├── database.service.ts        # shared DB helpers (annotate outfits, dedup)
│   └── ...
├── db/
│   ├── schema.ts          # Drizzle table definitions + RLS policies (via pgPolicy)
│   ├── indexes.sql        # hand-written indexes that Drizzle doesn't cover
│   └── index.ts           # exports the `db` client
├── schemas/               # zod input validation
├── utils/                 # prompts, taxonomy, vibe-filters, color-matching, circuit-breaker, cost-tracker, ai-analytics, content-filter, error-sanitizer
├── middleware/            # authenticate, aiConsentGuard, rate-limit config
├── data/                  # static: starter-wardrobe.ts (36 SKUs)
└── types/                 # shared types (outfit, tryon, etc.)
```

## Bootstrap

`src/app.ts` (~200 lines) does:
1. Reads + validates env via `config/env.ts` (zod schema).
2. Registers Fastify plugins: helmet, CORS, JWT (via Supabase JWKS), rate-limit, sensible.
3. Registers routes under `/api/v1/*`.
4. Wires cost-tracker + PostHog + circuit-breaker singletons.
5. Listens on `PORT` env (Railway sets it) or 3000.

## Request lifecycle

```
mobile ──► HTTPS /api/v1/wardrobe
             │
             ▼
       Fastify (Node.js worker)
             │
             ├─ middleware: helmet, cors, ratelimit
             ├─ preHandler: authenticate     ← verify JWT, populate request.user
             ├─ preHandler: aiConsentGuard   ← for AI routes only
             ▼
       Route handler
             │
             ├─ zod validate request.body
             ├─ call service (business logic)
             │      │
             │      ├─ Drizzle → Postgres
             │      ├─ Gemini API
             │      ├─ RevenueCat REST
             │      └─ Supabase Storage
             │
             ▼
       Return JSON { success, data | error }
```

## Error handling

Two shapes are returned:

```json
// success
{ "success": true, "data": { ... } }

// error
{ "success": false, "error": { "code": "STARTER_READ_ONLY", "message": "..." } }
```

The mobile client's `lib/api.ts` throws an `ApiError` with `.code` populated so `catch` blocks can branch on typed codes. See **[Error codes](/control/docs/reference/error-codes)**.

## Config + env

`src/config/env.ts` is the single source of truth. It runs a zod parse at boot; missing critical env crashes the process immediately. Full var list in **[Reference / Env vars](/control/docs/reference/env-vars)**.

## Rate limits

Applied per-route via Fastify's `@fastify/rate-limit`:

| Route | Limit |
|---|---|
| `POST /ai/process-batch` | 10/hour per user |
| `POST /ai/virtual-tryon` | limited via coin gate, not rate |
| `POST /wardrobe/seed-starter` | 5/hour per user |
| `POST /subscription/charge` | none (RC V2 handles idempotency) |
| everything else | 200/minute per IP |

## Cache

`src/config/cache.ts` is a very simple `Map<key, {value, expires}>` keyed by userId. Used by outfit generation to memoize wardrobe reads within a session. Purged on any mutation via `cache.deletePattern(userId)`.

## Circuit breaker

`src/utils/circuit-breaker.ts` tracks failure counts per model name. When Gemini 3 Pro fails too many times in a rolling window, the breaker opens and the try-on / tagging services skip straight to Flash. Auto-heals after a cooldown.
