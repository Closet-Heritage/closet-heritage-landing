---
title: Investigate a try-on failure
sub: Log trace + Gemini status + retry
---

**Symptom**: user reports a try-on failed. They may or may not have gotten their coins back.

## Step 1 — check coins were refunded

`SELECT balance FROM ...` — actually the coin ledger lives in RevenueCat. Use the RC dashboard, filter by user_id, look at recent debits + credits. The pattern should be:

- Debit 5 coins with reason `virtual try-on`.
- Credit 5 coins with reason `refund: try-on generation failed`.

Both should happen within the same second.

If only the debit is there (no matching refund):

- The backend refund call failed. This should have been logged as `🚨 CRITICAL:` in Railway.
- Manual refund via the runbook: **[Refund a payment](/control/docs/runbooks/refund-payment)** — "Manual coin refund".

## Step 2 — find the log trace

In Railway logs, search for the user_id or the `requestId` if the user gave you one. The pipeline logs at every stage:

```
👗 Virtual try-on: fetching avatar...
👗 Avatar: 3400 KB → 890 KB
👗 Virtual try-on: fetching 3 item images...
👗 Item images fetched: 120KB, 95KB, 110KB
👗 Descriptions: [1] cotton, long sleeves ...
👗 Generating try-on image (gemini-3-pro-image)...
```

If the log ends mid-stage, that's where it failed.

## Common failure modes

**Gemini rate limit / quota**

```
❌ Virtual try-on error: 429 Too Many Requests
```

Cause: our Gemini API quota hit the ceiling. See dashboard at `console.cloud.google.com`. Solutions:
- Request higher quota via GCP.
- Wait an hour (rolling window).
- Circuit breaker will open automatically after ~10 failures in a window; new try-ons will use Flash exclusively.

**Content policy block**

```
❌ Virtual try-on error: The response was blocked because it contains sensitive content.
```

Cause: Gemini's safety filter rejected either the avatar (rare) or the outfit. Solutions:
- Ask the user to try a different outfit.
- If it's repeatable on the same outfit → investigate the item photos. Sometimes clothing photos get flagged for spurious reasons.

**Timeout**

```
❌ Virtual try-on error: Timeout after 45000ms
```

Cause: Gemini took longer than 45s. Sometimes just an unlucky call. Retry usually succeeds.

**Collage layout**

```
👗 Collage detected (1200x800), retrying...
```

Not a failure per se — the pipeline retries automatically. If it retries 3 times and still gets collages, gives up. Usually a prompt regression — investigate recent changes to `buildVirtualTryonPrompt`.

**BG removal both failed**

```
⚠️ BG removal failed — falling back to JPEG
```

Try-on still succeeds but the image has the studio background. Investigate remove.bg quota + @imgly model.

## Step 3 — reproduce (if possible)

If the user is willing:

- Ask them to open the same outfit and hit Try On again. If it succeeds, this was a one-off. If it fails again with the same error, it's systemic.
- If systemic + repeatable, that outfit is a good test case. Ask them to share the outfit ID.

## Step 4 — PostHog Error Tracking

Every failure captures a tracked exception with:
- `ai_model` (which model was used)
- `fallback_model`
- `clothing_item_count`
- `gender`
- `request_id`
- `processing_time_ms`

In PostHog → Issues, filter by these to spot patterns. If a specific model or item count correlates with failures, that's a lead.

## Escalation

If we're seeing >10% try-on failure rate over an hour:

- Check Gemini status page: `https://status.cloud.google.com`
- Check GCP quota dashboard.
- If a specific model is dead, force the fallback: temporarily comment out the Pro path in `virtual-tryon.service.ts` and deploy.

## Files

`ch-backend-main/src/services/virtual-tryon.service.ts` — the pipeline.
`ch-backend-main/src/utils/prompts.ts` — the prompt.
`ch-backend-main/src/utils/circuit-breaker.ts` — automatic Pro→Flash switch.
`ch-backend-main/src/config/gemini.ts` — model names and configs.
