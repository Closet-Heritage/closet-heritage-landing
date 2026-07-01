---
title: Env vars
sub: Every environment variable across all 3 repos
---

Cross-checked against `src/config/env.ts` (backend) and grep of actual reads (mobile + landing) as of 2026-07-01.

## `ch-backend-main/.env.local`

**Server**
- `NODE_ENV` — `development` locally, `production` on Railway.
- `PORT` — defaults 3000; Railway sets its own.
- `LOG_LEVEL` — `debug` | `info` | `warn` | `error`. Default `info`.

**Supabase** (all required)
- `SUPABASE_URL` — e.g. `https://<ref>.supabase.co`.
- `SUPABASE_ANON_KEY` — public anon key.
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS. Never expose to clients. Also doubles as the `adminSecret` value pg_cron uses when calling cron endpoints.
- `SUPABASE_JWT_SECRET` — the shared secret used by `authenticate` middleware (`jwt.verify(token, secret)` — HS256, no JWKS). Rotation invalidates every live user session.

**Database** (required)
- `DATABASE_URL` — Postgres pooler URL. Port **6543** requires `prepare: false` in postgres.js.

**Gemini** (required)
- `GEMINI_API_KEY` — Google AI Studio key.

**Feature flags**
- `ENABLE_BG_REMOVAL` — string `"true"` / `"false"`. Default true.

**Third-party** (all optional)
- `REMOVEBG_API_KEY` — enables high-quality background removal; @imgly is the fallback.
- `RESEND_API_KEY` — outbound email. Used by the backend for waitlist invite batches (`waitlist.routes.ts`). Landing does not currently send email.
- `EXPO_ACCESS_TOKEN` — for sending Expo push with signed requests.
- `POSTHOG_API_KEY` — server-side event capture.
- `POSTHOG_HOST` — defaults `https://us.i.posthog.com`.
- `REVENUECAT_SECRET_KEY` — for coin V2 API + entitlement lookups.
- `REVENUECAT_WEBHOOK_SECRET` — verifies RC webhook signatures.
- `REVENUECAT_PROJECT_ID`
- `PAYSTACK_SECRET_KEY` — signs Paystack webhook verifications.
- `CHECKOUT_TOKEN_SECRET` — HMAC key for the web checkout token. **Required in production** (env.ts enforces length ≥ 32 in prod); dev falls back to `SUPABASE_JWT_SECRET`.

**Not used** (deliberately omitted from schema — do NOT add them without wiring):
- `PAYSTACK_WEBHOOK_SECRET` (Paystack signs webhooks with `PAYSTACK_SECRET_KEY`).
- `CRON_SECRET` (cron auth uses `adminSecret = SUPABASE_SERVICE_ROLE_KEY` in JSON body).
- `CORS_ORIGINS` (allowed origins hardcoded in `app.ts`).

## `closet-heritage-app/.env.local`

Everything prefixed `EXPO_PUBLIC_` is bundled into the JS at build time. Values are visible in the compiled bundle — treat as public.

**Supabase + backend**
- `EXPO_PUBLIC_API_URL` — backend base URL (`https://api.closetheritage.com/api/v1` or `http://<your-lan-ip>:3000/api/v1` for local).
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SHARE_URL` — where shared-outfit deep links point. Defaults to `https://closetheritage.com`.

**Analytics**
- `EXPO_PUBLIC_POSTHOG_API_KEY` — app skips capture if missing.
- `EXPO_PUBLIC_POSTHOG_HOST`

**RevenueCat**
- `EXPO_PUBLIC_RC_IOS_KEY` — RC public iOS key.
- `EXPO_PUBLIC_RC_ANDROID_KEY` — RC public Android key.

**OAuth**
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — Google Sign-In iOS OAuth client.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google Sign-In web OAuth client (required for Google Sign-In on both platforms).

**Web checkout**
- `EXPO_PUBLIC_WEB_CHECKOUT_URL` — URL the paywall opens for Paystack. Falls back to `https://closetheritage.com/subscribe`.

Non-`EXPO_PUBLIC_` values in `app.json` under `extra`:
- `eas.projectId` — EAS + push notifications.
- App Store / Play Store metadata.

Full auth credential list (Apple bundle ID, Google client IDs, Resend sender) lives in the CTO's password manager and in `MEMORY.md` under "Auth Credentials".

## `closet-heritage-landing/.env.local`

**Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **required for control panel.** Copy from backend `.env.local`.

**Control panel** (first two required to log in)
- `CONTROL_PASSWORD` — the shared login password. Any 32+ char string.
- `CONTROL_SIGNING_KEY` — HMAC key for the session cookie. Any 32+ char random string. **Do not** reuse `CONTROL_PASSWORD`.
- `CONTROL_SESSION_VERSION` — optional positive integer, default `1`. Bump to invalidate every live session (panic-log-everyone-out) without rotating the signing key.

**Backend API**
- `NEXT_PUBLIC_BACKEND_API_URL` — primary base URL used by `/shared/*`, `/subscribe`, and control-panel fallback. Default `https://api.closetheritage.com/api/v1`.
- `BACKEND_API_URL` — server-only override for RSC + `opengraph-image` routes. Default `http://localhost:3000/api/v1` in dev.

**Backend health check** (optional)
- `NEXT_PUBLIC_BACKEND_URL` — used only by `/control/system` for the `/health` ping. If missing, the tile shows "not configured" (amber, not red).

**PostHog** (optional)
- `NEXT_PUBLIC_POSTHOG_KEY` — that's the current name in `app/providers.tsx`. (Backend + mobile use `POSTHOG_API_KEY`; landing has diverged. Aligning them is a nit — pick a direction on a future cleanup pass.)
- `NEXT_PUBLIC_POSTHOG_HOST`

**Deep links / marketing**
- `NEXT_PUBLIC_APP_STORE_URL` — optional. App Store URL used by invite + share cards. Falls back to an internal default in `lib/invite-config.ts`.

Paystack keys are **not** here — they live in the backend only. The landing subscribe page requests an `accessCode` from `POST /api/v1/payment/initialize` and does the rest in-browser.

## Where to find real values

- **Supabase keys**: Supabase dashboard → Project Settings → API.
- **RevenueCat keys**: RC dashboard → Projects → API keys.
- **Paystack keys**: Paystack dashboard → Settings → API Keys & Webhooks.
- **Gemini**: Google AI Studio → API keys.
- **Resend**: Resend dashboard → API keys.
- **Random secrets** (`CONTROL_PASSWORD`, `CONTROL_SIGNING_KEY`, `CHECKOUT_TOKEN_SECRET`, `SUPABASE_JWT_SECRET`): generate with `openssl rand -hex 32`.

CTO's password manager holds the current-good values for production.

## Rotation

- If any key leaks: rotate immediately in the source of truth, redeploy every service that uses it.
- `SUPABASE_JWT_SECRET` rotation: every mobile session becomes invalid. Users re-sign-in. Coordinate deploy.
- `CONTROL_PASSWORD` rotation: no live sessions invalidated. Users update their `.env.local` and log in again.
- `CONTROL_SIGNING_KEY` rotation: every control-panel session invalidated. Users must re-log-in.
- `CONTROL_SESSION_VERSION` bump: every control-panel session invalidated. Cheaper than rotating the signing key.
