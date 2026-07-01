---
title: Error codes
sub: Every ApiErrorCode used across the app
---

## Format

Every backend error response looks like:

```json
{
  "success": false,
  "error": {
    "code": "STARTER_READ_ONLY",
    "message": "Starter items can't be edited..."
  }
}
```

The mobile client's `lib/api.ts` throws an `ApiError` with `.code` populated. `catch` blocks branch on `err.code` — never on `err.message` (the user-facing copy can change; the code is the contract).

## The union

Defined in `closet-heritage-app/lib/errors.ts` as `type ApiErrorCode`. Anything the backend returns *must* be in this union, otherwise mobile compile fails when we branch on it. **List verified against the file.**

### Input / validation

- `VALIDATION_ERROR` — zod parse failure at the schema boundary.
- `INVALID_INPUT` — free-text catch-all for input-level rejections.

### Auth

- `UNAUTHORIZED` — no JWT / no Bearer prefix.
- `INVALID_TOKEN` — JWT signature verification failed.
- `TOKEN_EXPIRED` — JWT `exp` past.
- `FORBIDDEN` — authenticated but not allowed on this resource.
- `AI_CONSENT_REQUIRED` — AI-touching route hit without `ai_consent_at` set on the profile.

### Resource-not-found

- `NOT_FOUND` — generic.
- `ITEM_NOT_FOUND` — clothing item.
- `BATCH_NOT_FOUND` — upload batch.
- `USER_NOT_FOUND` — auth/profile.
- `OUTFIT_NOT_FOUND` — outfit.

### State

- `NOT_IN_SET` — trying to unlink an item that isn't in a matching set.
- `STARTER_READ_ONLY` — mutation attempted on a starter item.
- `AVATAR_EXISTS` — seed-starter with `also_use_avatar=true` when the user already has an avatar.
- `PERSONA_GENDER_MISMATCH` — user picked a persona for a gender that doesn't match their profile.
- `PERSONA_UNAVAILABLE` — persona was deactivated between the persona-list fetch and the seed attempt.
- `PERSONA_NOT_READY` — persona is dark (e.g. Smart Casual Weekend before the landing redeploy).
- `SEED_FAILED` — transactional starter seed rolled back.
- `EMPTY_WARDROBE` — outfit-generation attempted with no items.
- `MISSING_CATEGORY` — outfit-generation attempted but the user has no tops+bottoms and no dresses.
- `REGENERATION_LIMIT` — item re-extract attempted more than allowed.

### Rate + quota

- `RATE_LIMIT_EXCEEDED` — Fastify rate-limit rejection.
- `INSUFFICIENT_COINS` — try-on / outfit-planning attempted below the coin threshold.

### AI / try-on

- `AI_SERVICE_ERROR` — Gemini call failed non-transiently.
- `TRYON_GENERATION_FAILED` — try-on pipeline gave up (retries exhausted).
- `TRYON_ERROR` — try-on generic failure.

### Server + infrastructure

- `INTERNAL_ERROR` — unexpected server crash.
- `DATABASE_ERROR` — Postgres error.
- `STORAGE_ERROR` — Supabase Storage upload failure.
- `SERVICE_UNAVAILABLE` — downstream dependency dead.
- `PAYLOAD_TOO_LARGE` — request body over 10 MB (image uploads).
- `TIMEOUT_ERROR` — server-side timeout.
- `FEATURE_NOT_IMPLEMENTED` — stubbed endpoint the mobile app must not call yet.

### Network (client-side, thrown before hitting the wire)

- `NETWORK_ERROR` — no connectivity.
- `UNKNOWN_ERROR` — safety net.

## User-friendly messages

`lib/errors.ts` also exports `USER_MESSAGES: Partial<Record<ApiErrorCode, string>>` mapping every code to copy that's safe to show the user (no "Postgres error 42501" leaking through). `safeErrorMessage(err, fallback)` reads it.

Rules:
- Never show `INTERNAL_ERROR`'s message directly. Use the fallback.
- Always show `INSUFFICIENT_COINS` — the mapped copy routes the user to the paywall.
- For `STARTER_READ_ONLY`, `AVATAR_EXISTS`, `PERSONA_*`, `SEED_FAILED` — the mapped copy is the canonical UX. Don't override.

## Adding a new code

1. Add the string literal to `ApiErrorCode` in `closet-heritage-app/lib/errors.ts`.
2. Add a user message in `USER_MESSAGES` (unless you deliberately want the fallback).
3. Return it from the backend in the error-object shape.
4. Handle it in the catch block on mobile (or let it fall through to the fallback).
5. Run `npx tsc --noEmit` in both mobile and (if you use `ApiErrorCode` there) backend.

## HTTP status conventions

The status code on the response is a hint, not a source of truth. `code` is what mobile switches on. But roughly:

- `400` — client input validation
- `401` — auth missing/invalid
- `403` — auth OK but forbidden
- `404` — resource
- `409` — state conflict (already exists, race)
- `429` — rate limit or coin gate
- `500` — server oops
- `503` — dependency down
