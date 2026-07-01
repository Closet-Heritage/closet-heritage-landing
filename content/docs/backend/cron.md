---
title: Cron jobs
sub: Scheduled work
---

The backend has no long-running scheduler. Instead, **Supabase `pg_cron`** hits three HTTP endpoints on a schedule using `net.http_post`. Each request carries the Supabase service-role key as `adminSecret` in the JSON body; the backend compares against `config.supabaseServiceRoleKey` and rejects on mismatch.

## Configured jobs (production, verified against `cron.job`)

| Job | Endpoint | Schedule (UTC) | Purpose |
|---|---|---|---|
| `daily-re-engagement` | `POST /api/v1/cron/re-engagement` | `0 19 * * *` (7:00 pm daily) | Copy-varying pushes based on `re_engagement_tier`, updates the tier column |
| `daily-subscription-reminders` | `POST /api/v1/cron/subscription-reminders` | `0 9 * * *` (9:00 am daily) | Reminds users about expiring trials and cancelled-at-period-end subs |
| `reap-stuck-payment-transactions` | `POST /api/v1/cron/reap-stuck-transactions` | `*/5 * * * *` (every 5 min) | DELETEs 'processing' payment_transactions older than 5 min so mobile polling can bail cleanly |
| `daily-recs-retention` | (inline SQL — no HTTP) | `0 3 1 * *` (3:00 am on the 1st) | `DELETE FROM daily_recommendations WHERE rec_date < CURRENT_DATE - 60` |

The 4th HTTP endpoint the code exposes is `POST /api/v1/cron/daily-recommendations`, but it isn't currently scheduled by any pg_cron job. Wire it manually via `SELECT cron.schedule(...)` when we're ready to enable daily recs, or trigger from the app.

## Auth pattern

```json
POST /api/v1/cron/re-engagement
Content-Type: application/json

{ "adminSecret": "<Supabase service-role JWT>" }
```

The handler:

```typescript
const { adminSecret } = request.body as { adminSecret?: string };
if (!adminSecret || adminSecret !== config.supabaseServiceRoleKey) {
    return reply.status(401).send(...);
}
```

Deliberately in the JSON body (not a header) because pg_cron's `net.http_post` composes headers strictly and it's easier to attach a body than to encode auth into headers cross-environment.

**Do not** post the service-role key from a browser context — it grants full RLS bypass. Only Supabase's own scheduler should hold this key.

## Re-engagement

`src/routes/cron.routes.ts` → `reEngagementHandler`. Daily at 7pm UTC:

1. `SELECT profiles` grouped by days-since-`last_active_at`.
2. Tier semantics driven by push cadence (verify `re-engagement.service.ts` before changing):
   - Tier 0 — never pushed re-engagement.
   - Tier 1 — pushed after ≥2 days idle.
   - Tier 2 — pushed after ≥7 days idle.
   - Tier 3 — pushed after ≥14 days idle (terminal — no further advancement).
3. `UPDATE profiles.re_engagement_tier` on advancement.
4. `buildMessage()` composes copy from real item/outfit counts (e.g. "You have 12 pieces waiting to become an outfit").
5. Send push via `notification.service.ts`; only advance tier on successful delivery.

No hard 7-day per-user throttle; the advancement itself is the throttle.

## Subscription reminders

Daily at 9am UTC. Targets Paystack/Campay (mobile money) subscribers — those channels have no auto-renew, so users must manually resubscribe.

1. Find subscriptions where `current_period_end` is within 3 days AND `cancel_at_period_end = false` AND provider is a MoMo channel → "Your subscription ends in N days — tap to renew" push.
2. Records each notification so it doesn't re-fire the next day.

Trials + auto-renew (RC-managed) subscribers are handled by RevenueCat directly, not this job.

## Reap stuck transactions

Every 5 minutes:

- `DELETE FROM payment_transactions WHERE status='processing' AND provider='paystack' AND created_at < NOW() - INTERVAL '5 minutes'`.
- Not an UPDATE — a hard DELETE. The row disappears entirely, so the mobile client's polling by `reference` 404s cleanly and shows an error instead of a stuck spinner.

RC-provider rows are not reaped because RevenueCat's webhook lifecycle owns them.

## Manual invocation for debugging

```bash
curl -X POST https://api.closetheritage.com/api/v1/cron/reap-stuck-transactions \
  -H "Content-Type: application/json" \
  -d '{"adminSecret": "'"$SUPABASE_SERVICE_ROLE_KEY"'"}'
```

Returns a JSON summary. Safe to call anytime — idempotent.

## Failure handling

Split behavior — verify before assuming:

- `re-engagement` and `daily-recommendations` handlers catch errors, log via `console.error`, and return **HTTP 500** with `{ success: false, error: { code, message } }`.
- `subscription-reminders` and `reap-stuck-transactions` have no top-level try/catch — an unhandled throw falls through to Fastify's default 500 handler.

pg_cron does not retry on 500 in either case. Deliberate — a genuine crash is better surfaced by alerting than by a retry storm.

Post-launch: wire cron failures to PostHog Error Tracking so systemic misses become visible.

## Not implemented (yet)

- Weekly digest push.
- Automatic ambassador payouts (manual for now — see runbooks).
- Storage garbage collection for orphan `originals/` files (reachable when we cross ~100 GB).
