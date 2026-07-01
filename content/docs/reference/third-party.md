---
title: Third-party services
sub: Every external SaaS we depend on
---

## Supabase

- **Purpose**: Postgres DB, Auth, Storage, Realtime.
- **Region**: `aws-1-eu-central-1` (Frankfurt) via pooler.
- **Cost**: currently on free tier. Will upgrade to Pro ($25/mo) around first 500 users for the storage + auth limits.
- **Backups**: automatic daily; point-in-time recovery on Pro+.
- **Failure mode**: if Supabase is down, mobile app can't fetch anything. No offline mode. Users see a "no connection" error.
- **Contact**: dashboard support ticket. Response usually within 24h.

## Google Gemini (via GenAI Studio)

- **Purpose**: All AI — image validation, tagging, grid generation, try-on, chat.
- **Cost**: ~$0.08–0.15 per user photo processing, ~$0.10–0.15 per Pro try-on, ~$0.04 per Flash try-on.
- **Quotas**: per-model, per-project. Currently generous but not infinite.
- **Failure mode**: circuit breaker skips Pro when it's failing; Flash falls back. If both are down, try-on returns error and refunds coins.
- **Contact**: Google Cloud support.

## RevenueCat (mobile IAP wallet)

- **Purpose**: Apple / Google in-app purchases + Virtual Currency V2 for our coin economy.
- **Cost**: 1% of tracked revenue (their pricing). Free until $2.5K MRR.
- **Failure mode**: if RC is down, mobile purchases and coin debits fail. `INSUFFICIENT_COINS` errors surface even if the user has coins.
- **Webhook**: `POST /webhooks/revenuecat` — signature-verified.
- **Beta**: Virtual Currency V2 is in beta. If issues arise, plan is to add a local DB cache and reconcile.
- **Contact**: rc-slack support in RC dashboard.

## Paystack (web payments — Ghana)

- **Purpose**: MoMo + card payments for the web checkout flow (Ghana users mostly).
- **Cost**: 1.95% per transaction (Ghana local rate).
- **Failure mode**: if Paystack is down, users on the paywall can only pay via Apple/Google IAP (which they may not want in Ghana).
- **Webhook**: `POST /payment/paystack-webhook` — HMAC signature-verified with INSERT-as-lock idempotency.
- **Live mode**: **LIVE**. We have real paying customers via Paystack.
- **Contact**: Paystack support (usually WhatsApp for Ghana accounts).

## PostHog

- **Purpose**: Analytics (events + funnels) + Session Replay + Error Tracking.
- **Cost**: free tier — 1M events/mo, 5K session replays, error tracking.
- **Sampling**: session replay at 10% in production; masked text inputs.
- **Failure mode**: if PostHog is down, mobile events queue locally and flush later. No product impact.
- **Contact**: in-dashboard.

## Resend

- **Purpose**: Transactional email (Contact Us replies, Supabase auth emails).
- **Cost**: free tier — 100 emails/day; upgrade when needed.
- **Domain**: `mail.closetheritage.com` (subdomain to protect root reputation).
- **Sender**: `hello@mail.closetheritage.com`.
- **Failure mode**: emails fail silently; not user-visible.

## Railway

- **Purpose**: Backend hosting + cron. Auto-deploys on push to `main`.
- **Cost**: ~$20/mo starter. Scales with usage.
- **Failure mode**: if Railway is down, backend is down. Mobile app can't do anything AI or payment-related.
- **Health check**: `GET /health`. Railway pings it. Failed checks → auto-restart.

## Vercel

- **Purpose**: Landing site + control panel hosting.
- **Cost**: free tier is fine for our traffic. Analytics is $10/mo if enabled.
- **Failure mode**: landing goes down. Public-facing marketing pages are dead. Control panel inaccessible. Mobile app is unaffected because it doesn't depend on landing at runtime (except for shared-outfit deep links).

## Cloudflare (via closetheritage.com DNS)

- **Purpose**: DNS + CDN + WAF.
- **Failure mode**: apex domain 307→www redirect adds ~50–100ms first-visit. Known caveat, low-impact.

## OneSignal / Expo Push

- **Purpose**: Push notifications on both platforms via Expo's push service.
- **Cost**: free.
- **Failure mode**: pushes silently drop; users don't get daily-rec or re-engagement notifications for that window.

## Apple + Google Developer

- **Purpose**: App Store + Play Store distribution + IAP infrastructure.
- **Cost**: $99/year (Apple), $25 one-time (Google).
- **Failure mode**: app review can reject a build. See `GO-LIVE-CHECKLIST.md` for the build-7 resubmission history.

## Figma

- **Purpose**: Design source of truth.
- **Cost**: free (single-editor plan works for 2 people).

## GitHub

- **Purpose**: Source control + Actions (none configured yet — Railway/Vercel handle deploy).

## Notion / Google Docs

- **Purpose**: Shared docs the doc panel doesn't cover — hiring notes, strategy, meeting minutes.

## No dependencies on

- Firebase, AWS (except via Supabase / Vercel), any custom-hosted ML models, Datadog / Sentry (Sentry is on the roadmap for native crash tracking).
