---
title: Refund a payment
sub: Paystack + RevenueCat
---

## Two systems, refund each separately

Money moves on the payment provider. Coins move on RevenueCat. A "full refund" usually needs both.

**There is no `/subscription/refund` HTTP endpoint.** Refunds are internal-only. All manual actions go through provider dashboards + direct SQL.

## RevenueCat — mobile IAP refund

Apple / Google refunds:

1. **User initiates** — refund via Apple Support or Google Play Support. We can't force it from our side; we can vouch.
2. **RC receives a REFUND webhook** — our backend handles it in `webhook.routes.ts`:
   - Sets `subscriptions.status = 'refunded'`.
   - Optional coin clawback: we deposit the negative amount if the user still has coins. If they've already spent the coins on try-ons, clawback fails silently and we log `🚨 CRITICAL:`.
3. **User loses access** at end of current billing period (Apple/Google behavior). No mid-period revocation.

For sandbox / TestFlight testing: use RC's dashboard controls.

## Paystack — web MoMo / card refund

Refunds must be initiated in the Paystack dashboard:

1. Log into Paystack dashboard → Transactions → find the transaction by `payment_transactions.provider_transaction_id`.
2. Click Refund. Confirm.
3. Paystack posts a `refund.processed` webhook to `POST /api/v1/webhooks/paystack`. Our handler:
   - Updates `payment_transactions.status = 'refunded'`.
   - Downgrades the subscription: if the refund covers the current period, revoke access; otherwise let it ride until period end.
4. Mobile client sees the plan drop via `useSubscription()` refresh.

## Manual coin adjustment (no HTTP endpoint)

There is no admin HTTP endpoint to adjust coins. Two options:

**A. RevenueCat dashboard** — RC's Virtual Currency page supports manual balance adjustments. Recommended path.

**B. Direct via the backend `subscription.service.ts`** — invoke `depositCoins(userId, amount, reason, idempotencyKey)` from a one-off script (`scripts/manual-refund.ts`) running against production env. Requires `REVENUECAT_SECRET_KEY`.

Either way — **always pass an idempotency key** so a duplicate call cannot double-credit.

## Full refund workflow (both money + coins)

1. Verify the complaint — check `payment_transactions` for the record.
2. Refund the money via Paystack (or ask Apple/Google to refund on IAP).
3. Wait for webhook to land (usually <1 min).
4. If coins weren't clawed back automatically and the user still has enough remaining, no action needed.
5. If the user already spent the coins, decide: eat the loss (we already spent Gemini money too) or ask them to re-earn.
6. Reply to the user's support ticket with confirmation.

## Prevent it happening again

Every refund should trigger a look at why the user asked. Common patterns:

- **Try-on quality was bad.** Add the outfit ID + image to a triage list; feed back into prompt tuning.
- **They didn't understand what they were buying.** Improve paywall copy.
- **They subscribed while trying to sign in.** Check the paywall's escape hatches.
- **They're farming refunds.** Note in a support-side spreadsheet; block if egregious.

## Files

| Concern | File |
|---|---|
| RC webhook handling | `ch-backend-main/src/routes/webhook.routes.ts` (POST `/webhooks/revenuecat`) |
| Paystack webhook handling | `ch-backend-main/src/routes/webhook.routes.ts` (POST `/webhooks/paystack`) |
| Coin deposit / debit | `ch-backend-main/src/services/subscription.service.ts` (`depositCoins`, `debitCoins`) |
