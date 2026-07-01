---
title: Virtual try-on
sub: How Gemini renders users wearing outfits
---

The user taps **Try On** on an outfit and 20–60 seconds later sees a photorealistic image of themselves wearing those exact pieces. Costs 5 coins. This is the app's most expensive AI operation.

## 30-second summary

1. **User taps Try On** on the plan-outfit results screen.
2. Phone sends `POST /ai/virtual-tryon` with the avatar URL and item IDs.
3. **Backend charges 5 coins upfront** (refunded on failure).
4. **Backend fetches** avatar image + all item images, compresses.
5. **Backend describes each item** in words using DB tags (no extra AI call).
6. **Backend builds a long, specific prompt** — keep the face and pose, replace the clothes.
7. **Backend calls Gemini** with a hedged fallback strategy — 3 Pro is preferred, 3.1 Flash is backup.
8. **Backend removes background** via remove.bg (primary) or @imgly (fallback).
9. **Backend uploads** the result to Storage and returns the URL.
10. **Phone shows the image**, or shows an error and the coins are already refunded.

## Cost + time

| Metric | Value |
|---|---|
| Coin cost | 5 |
| Typical time | 20–45s (Pro) / 8–15s (Flash) |
| Server-side per-model timeout | 45s |
| Phone timeout | 90s |
| Hedge trigger delay | 15s |
| Gemini Pro cost | ~$0.10–0.15 / call |
| Gemini Flash cost | ~$0.04 / call |
| Primary model | `gemini-3-pro-image` |
| Fallback model | `gemini-3.1-flash-image` |

## Why we charge coins *before* the AI runs

- If we charged after and the debit failed, the user would have gotten a free try-on. Since Gemini costs us real money, we can't afford that.
- If the AI fails, we refund with an idempotent key — retries are safe.
- If the debit itself fails (RC outage), we stop immediately — no coins moved, user retries later.

## The hedged Gemini call

`generateImageWithHedge()` in `virtual-tryon.service.ts:160`. This is the most sophisticated piece of the pipeline.

```
T=0s     fire Gemini 3 Pro
T=15s    if Pro hasn't answered → quietly fire Gemini Flash in parallel
T=any    whichever succeeds first wins. If Pro wins, Flash result is discarded.
T=45s    hard timeout on either
```

Layered on top: a **circuit breaker** per model. If Pro has failed too many times in a rolling window, the breaker opens and we skip Pro entirely for a while. Auto-heals after cooldown.

Every result runs a **quality gate**: if the image is wider than it is tall (a collage or landscape), we reject and retry. Gemini sometimes ignores the `aspect_ratio: '2:3'` instruction.

## Why the prompt is so long

`buildVirtualTryonPrompt()` in `src/utils/prompts.ts:355`. Every sentence is there because Gemini did something wrong.

- "Output exactly ONE photograph" — because it made collages.
- "Same face, same pose" — because it swapped faces.
- "Don't invent zippers on pullovers" — because it added zippers.
- "Don't enlarge the Nike swoosh" — because it centered logos.
- "Wear shirts fully buttoned" — because it left shirts open.

Every rule earns its keep. Adding a rule = something broke in production and we fixed it forward.

## Prompt structure

1. **FORMAT** — single photo, no collage, no lookbook.
2. **IDENTITY** — the person is the exact same one in Image N (the avatar).
3. **CLOTHING** — Image 1 is [description], Image 2 is [description], etc.
4. **DRESS BODY GUIDE** (only if outfit contains a dress) — dress covers both top + bottom, no trousers or shirts peek out.
5. **IMAGE MAP** — numbered legend.
6. **TEXT, LOGOS & BRANDING** — reproduce only what's in the reference, no artistic liberties.
7. **OUTPUT** — full body, neutral studio background, 1024×1536 minimum, portrait.

Item descriptions come from `buildItemDescription()` — assembled from DB tags (material, pattern, sleeve length, heel height, etc.) so we don't need an extra "describe this item" AI call.

## Background removal

Two removers in sequence:

1. **remove.bg API** — fast, accurate, paid. Only if `REMOVEBG_API_KEY` is set.
2. **@imgly/background-removal-node** — ML model running on the server. Slower but free.

If both fail we keep the raw studio background. The try-on still works, just looks less polished.

After BG removal, `sharp.trim()` crops the transparent edges and we recompress to 1024×1536 PNG.

## Storage + response

Upload to `tryons/<userId>/<random>.png`. Return the public URL + updated coin balance in the response. Mobile stores it on the outfit's `tryon_image_url`.

## Failure handling

If any stage from image fetch onwards throws:

1. **Refund the 5 coins.** `depositCoins(userId, 5, 'refund: try-on generation failed', 'refund-<requestId>')` — the last argument is an idempotency key so double-refund is impossible.
2. **PostHog Error Tracking** — full context (model, item count, request ID, timing) as a tracked exception.
3. **Sanitized error to client** — the user sees "Try-on failed, please try again", never the raw Gemini error.

## Files you'd touch

| Concern | File |
|---|---|
| The whole algorithm | `src/services/virtual-tryon.service.ts` |
| The prompt | `src/utils/prompts.ts` (`buildVirtualTryonPrompt`) |
| Model names + Gemini config | `src/config/gemini.ts` (`MODELS`, `TRYON_CONFIG`) |
| Coin costs + charge + refund | `src/services/subscription.service.ts` |
| Circuit breaker | `src/utils/circuit-breaker.ts` |
| Background removal | `src/services/background-removal.service.ts` |
| Mobile button + optimistic UI | `app/plan-outfit/results.tsx` |
| Mobile hook | `hooks/useOutfits.ts` (`useTryOn`) |
