---
title: Auth flow
sub: Sign-in, AI consent, RLS
---

## Two auth systems, two purposes

**Supabase Auth** — the user's account. Governs who can log in, what rows they can read via RLS.

**Backend `authenticate` middleware** — every backend HTTP call validates the JWT the mobile client sent. Runs on every `preHandler: [authenticate]` route.

**Control panel auth** (this app) — a separate HMAC-signed cookie system, no Supabase involvement. See `lib/control-auth.ts`.

## User sign-in on mobile

Four ways in:
1. **Email / password** — `supabase.auth.signInWithPassword()`.
2. **Magic-link OTP** — `supabase.auth.signInWithOtp()` then user pastes the 6-digit code.
3. **Google Sign-In** — `@react-native-google-signin/google-signin` returns an ID token → `supabase.auth.signInWithIdToken({ provider: 'google', token })`.
4. **Apple Sign In** — Expo's `AppleAuthentication.signInAsync()` returns credentials → `supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce })`.

All four converge in `hooks/useAuth.ts`. Supabase returns a session with `access_token` (JWT, ~1 hour) and `refresh_token` (~30 days). The mobile app's `lib/supabase.ts` client auto-refreshes.

The session is stashed in `stores/auth.store.ts` (Zustand). The auth listener in `app/_layout.tsx` fires on `SIGNED_IN` / `SIGNED_OUT` / `TOKEN_REFRESHED`, syncs the store, and handles account-switch cleanup (React Query clear + Zustand store resets + PostHog identity reset).

## Backend `authenticate` middleware

Actual implementation lives at **`src/plugins/auth.ts`** (there is no `src/middleware/` directory). It's a plain `jsonwebtoken.verify()` against `SUPABASE_JWT_SECRET` — HS256, **not JWKS**. That means:

- No network round-trip on every request.
- **Rotating `SUPABASE_JWT_SECRET` invalidates every live mobile session.** Coordinate deploys.

```typescript
// src/plugins/auth.ts (paraphrased)
export async function authenticate(request, reply) {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return reply.status(401)...;
    const token = auth.slice(7);
    const payload = jwt.verify(token, config.supabaseJwtSecret) as SupabaseJwtPayload;
    request.user = { id: payload.sub, email: payload.email, role: payload.role ?? 'authenticated' };
}
```

Every protected route lists it: `fastify.get('/wardrobe', { preHandler: [authenticate], handler })`.

## AI consent guard

Apple App Review (Guideline 5.1.2(i)) requires explicit consent before user data is sent to third-party AI. On mobile, the AI-consent screen writes `profiles.ai_consent_at = NOW()`. On backend, routes that touch Gemini list `preHandler: [authenticate, aiConsentGuard]`. The guard reads `ai_consent_at`; if NULL, returns `403 { code: 'AI_CONSENT_REQUIRED' }`.

Applies to: `/ai/process-batch`, `/ai/virtual-tryon`, and any future AI-touching route.

## Row-Level Security (RLS) — the rule

Every table with user data has RLS enabled. The pattern:

```sql
CREATE POLICY "..." ON <table> FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "..." ON <table> FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "..." ON <table> FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

`auth.uid()` is Supabase's built-in that reads the JWT's `sub` claim. When the mobile app queries Supabase directly (like `supabase.from('outfits').select()`), the JWT is attached automatically, RLS runs, and the user only sees their own rows.

The backend uses the **service role** key, which bypasses RLS entirely. That's how we implement moderation (read every row) and per-user cleanup (delete rows across users after account deletion).

Special case: `clothing_items` INSERT/UPDATE additionally require `source = 'user' AND starter_sku_id IS NULL`. Starter rows are immutable to authenticated clients — the backend seeds them via service role and the app-layer STARTER_READ_ONLY guard blocks accidental mutations from the app.

Special case: `profiles.starter_*` columns are guarded by a trigger (`guard_profile_starter_columns`) that raises `42501` when authenticated tries to change them. Only service role can update those.

## Session lifetime + refresh

- Access token: ~1 hour, sent as `Authorization: Bearer <jwt>`.
- Refresh token: ~30 days, used silently by Supabase JS.
- On mobile, `supabase.auth.onAuthStateChange` fires `TOKEN_REFRESHED` when the JS SDK refreshes. React Query is not invalidated on refresh (it's the same user).

## Sign-out

Mobile `hooks/useAuth.ts` `signOut()` → `supabase.auth.signOut()` → auth listener fires `SIGNED_OUT` → `app/_layout.tsx` clears React Query, resets Zustand stores, calls PostHog `reset()`, and navigates to `/(auth)`.

## Delete account

Mobile calls `POST /api/v1/account/delete`. Backend:
1. Sweeps user's Storage folders (originals/, cropped/, tryons/, avatars/).
2. Deletes `auth.users.id` — CASCADE fans through profiles, clothing_items, outfits, subscriptions, etc.
3. Mobile signs the user out on success.

Nothing is soft-deleted. There's no "recovery" — required by GDPR / App Store guidelines.
