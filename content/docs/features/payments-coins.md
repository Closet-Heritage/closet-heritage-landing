---
title: Payments & coins
sub: RevenueCat + Paystack + coin economy
---

## Mental model

- **Subscriptions** put users on a **plan** (Trial / Standard / Premium).
- Each plan deposits **coins** on activation and on renewal.
- **Coins** gate expensive AI operations — try-on = 5 coins, outfit planning session = 1 coin.
- Coin balance is **additive**: `depositCoins` increments, never resets. Unused coins carry over across renewals.
- **Coin packs** (Small / Medium — Large deferred to v1.1) top up outside a subscription.

## Providers

- **Mobile IAP (iOS + Android)** — RevenueCat SDK on the phone; RC webhooks to `POST /api/v1/webhooks/revenuecat`.
- **Web (Ghana MoMo + card)** — Paystack embedded checkout on `closetheritage.com/subscribe`. Backend confirms via `POST /api/v1/webhooks/paystack`.

RevenueCat is the authoritative wallet — the Virtual Currency V2 API holds coin balances. Paystack payments flow through the backend, land as RC credits.

## Plans (mobile IAP)

| Plan | Price | Coins on activation | Try-ons possible | Notes |
|---|---|---|---|---|
| **Trial** | 30-day free | 30 | 6 | Auto-starts on account creation |
| **Standard** | $1.99 / mo | 50 | 10 | Coins deposited monthly (additive) |
| **Premium** | $2.99 / mo | 100 | 20 | Power user |

Standard annual: `1999` minor units (~$19.99). Premium annual: `2999` (~$29.99). See `src/routes/subscription.routes.ts` GET `/plans`.

Paystack GHS pricing is set in the Paystack dashboard + web checkout page — always confirm the live GHS numbers there before quoting, since USD↔GHS conversion drifts.

Coin packs:

| Pack | Price | Coins | Try-ons |
|---|---|---|---|
| Small | $0.99 | 30 | 6 |
| Medium | $2.99 | 100 | 20 (15% savings) |
| ~~Large (220 coins)~~ | deferred to v1.1 | — | — |

Coin costs (`src/services/subscription.service.ts` `COIN_COSTS`):
- Virtual try-on: **5 coins**
- Outfit-planning session (server-side `outfitGeneration`): **1 coin**
- Photo/avatar upload: **free**

## Mobile purchase flow

1. User taps "Upgrade" on paywall or Membership hub.
2. `usePaywall()` fires the RevenueCat SDK purchase.
3. Native IAP UI (Apple / Google) shows.
4. On success, RC updates entitlement locally.
5. RC posts `INITIAL_PURCHASE` webhook to our backend.
6. Backend inserts `subscriptions` row + `payment_transactions` row + deposits the plan's coin allotment via RC V2.
7. Mobile hits `useSubscription().refreshSubscription()` and sees the new plan.

## Paystack (web) flow

Ghana MoMo audiences can't use Apple/Google IAP. Instead the app opens `/subscribe` in an in-app browser with an **HMAC-signed token** carrying user identity:

1. Mobile hits `POST /api/v1/payment/checkout-token`. Response: `{ token, expiresIn }`. Payload is `{ userId, email, exp }` signed with `CHECKOUT_TOKEN_SECRET`.
2. `expo-web-browser.openBrowserAsync(url)` — Paystack embedded checkout on `EXPO_PUBLIC_WEB_CHECKOUT_URL` (defaults to `https://closetheritage.com/subscribe`). Plan + channel selected on the web page.
3. User pays (MoMo, card).
4. Paystack posts webhook to `POST /api/v1/webhooks/paystack` — signature verified.
5. Backend inserts `payment_transactions` row with status `processing` (UNIQUE on `(provider, provider_transaction_id)` gives idempotency for retries).
6. Backend verifies the payment amount, activates subscription via RC V2, deposits coins, sets transaction status `succeeded`.
7. Mobile browser closes; app polls `useSubscription()` and sees the new plan.

If a webhook never arrives (browser closed, network dropped), the row stays `processing` for **5 minutes** and then the reap-cron **DELETEs** it (not an UPDATE flip). Mobile polling by `reference` 404s cleanly. See **[Cron jobs](/control/docs/backend/cron)**.

## Charging coins

Every AI action calls `subscription.service.ts`:

```typescript
// Before try-on
const check = await canUserTryon(userId);
if (!check.allowed) throw INSUFFICIENT_COINS;
const debit = await chargeForTryon(userId);  // RC V2 debit
if (!debit) throw CHARGE_FAILED;

// ... run try-on ...

// If try-on failed:
await depositCoins(userId, 5, 'refund: ...', 'refund-<requestId>');
```

The **idempotency key** on refunds is critical — if the frontend retries, the refund only happens once.

## Trial coins

On sign-up (Supabase auth handles user creation → our `handle_new_user` trigger creates `profiles`), the RC trial webhook fires `INITIAL_PURCHASE_TRIAL`. Backend deposits `TRIAL_COINS = 30` via `depositCoins`. `subscriptions.trial_coins_deposited_at` tracks so we don't double-deposit on race.

## Cancellation

- **User cancels**: RC posts `CANCELLATION`. `subscriptions.cancel_at_period_end = true`. Access continues until `current_period_end`.
- **Expiration**: RC posts `EXPIRATION`. `status = 'expired'`. Falls back to Trial-tier coin limits.

## Refunds

- **Automatic** (try-on / outfit gen failure): backend calls `depositCoins` with an idempotency key.
- **Manual** (support): use RC dashboard for the money side + Virtual Currency page for coin adjustment. See **[Refund a payment](/control/docs/runbooks/refund-payment)**. There is **no `POST /subscription/refund` HTTP endpoint**.

## Failure logging

Every critical payment path logs `console.error('🚨 CRITICAL: ...')` when something can't be automated (coin refund failed, RC webhook out of order, Paystack signature mismatch, gift-code redemption drift). Visible in Railway logs. A **future control-panel enhancement** should surface these as a persistent queue.

## Files you'd touch

| Concern | File |
|---|---|
| Coin costs + wallet API | `ch-backend-main/src/services/subscription.service.ts` |
| RC webhook | `ch-backend-main/src/routes/webhook.routes.ts` (POST `/webhooks/revenuecat`) |
| Paystack webhook + checkout token | `ch-backend-main/src/routes/webhook.routes.ts` (POST `/webhooks/paystack`) and `payment.routes.ts` (checkout-token, identity, verify) |
| Plans endpoint | `ch-backend-main/src/routes/subscription.routes.ts` (GET `/plans`) |
| Mobile hook | `closet-heritage-app/hooks/useSubscription.ts` |
| Paywall UI | `closet-heritage-app/app/paywall.tsx` |
| Membership hub | `closet-heritage-app/app/manage-subscription.tsx` |
| Web checkout | `closet-heritage-landing/app/subscribe/page.tsx` |
