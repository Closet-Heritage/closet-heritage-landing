---
title: Local setup
sub: Get all three repos running on your machine
---

You need three repos running to develop against Closet Heritage end-to-end.

## 1. Clone

```
~/dev/cheritage-project/
├── closet-heritage-app/       # Expo mobile app
├── ch-backend-main/           # Fastify backend (Node.js)
└── closet-heritage-landing/   # Next.js landing + control panel (you're here)
```

## 2. Backend — `ch-backend-main`

Prereqs: Node 20+, npm, direct network to Supabase.

```bash
cd ch-backend-main
# .env.example is not currently maintained — see docs/reference/env-vars for
# the required variables, then paste values from the CTO's password manager.
touch .env.local
npm install
npm run dev                  # runs on :3000, pino-pretty logs
```

The backend connects to the **shared production Supabase** by default. If you want a scratch env, create a new Supabase project, apply `supabase/migrations/*.sql`, and point `SUPABASE_URL` + `DATABASE_URL` at it.

Health check: `curl http://localhost:3000/health` should return `{ ok: true }`.

## 3. Mobile — `closet-heritage-app`

Prereqs: same Node, plus **Xcode** (iOS) or **Android Studio** (Android). You cannot use Expo Go — the app has native modules (Google/Apple sign-in, in-app purchases, notification service extension). You need a development build.

```bash
cd closet-heritage-app
# .env.example is under-maintained; check docs/reference/env-vars for the full
# set. At minimum you need EXPO_PUBLIC_RC_IOS_KEY / _ANDROID_KEY, PostHog,
# and Google OAuth client IDs.
touch .env.local
npm install
# `expo prebuild` is only needed when the ios/ or android/ directory doesn't
# exist yet — both are checked in.
eas build --profile development --platform ios   # ~15 min, first time
# Install the resulting build on your device or simulator, then:
npm start                      # Metro bundler; scan QR from the dev build
```

For faster iteration once you have the dev build installed, use `npx expo start --dev-client`.

## 4. Landing + control panel — `closet-heritage-landing`

```bash
cd closet-heritage-landing
cp .env.example .env.local
npm install
npm run dev                    # runs on :3001
```

Then visit `http://localhost:3001/control/login`. Password is `CONTROL_PASSWORD` from your env file (paired with `CONTROL_SIGNING_KEY` — both required). Enter your name (Patience or Ryan); role is bound server-side. See **[Env vars](/control/docs/reference/env-vars)** for the full list.

## 5. Useful commands

**Type-check everything** (do this before every PR):
```bash
cd ch-backend-main && npx tsc --noEmit
cd closet-heritage-app && npx tsc --noEmit
cd closet-heritage-landing && npx tsc --noEmit
```

**Sync docs into the control panel** (after editing a source doc under `ch-backend-main/docs/`):
```bash
cd closet-heritage-landing && bash scripts/sync-docs.sh
```

**Apply a new Supabase migration**:
Prefer `supabase db push` if you have the Supabase CLI configured. Otherwise apply via the Supabase MCP tool from Claude Code, or hand-run the SQL in the Supabase dashboard.

## Troubleshooting

- **Metro fails to bundle after a dep change** → `rm -rf node_modules && npm install` then `npx expo start --clear`.
- **Backend crashes on start** with "SUPABASE_SERVICE_ROLE_KEY missing" → check `.env.local`. That key is in the CTO's password manager.
- **Landing tsc fails on `server-only` imports** → ensure you're not importing `lib/supabase-admin.ts` into a client component.
- **Control panel login says "wrong password"** → your `CONTROL_PASSWORD` in `.env.local` does not match what the server is comparing. Restart `npm run dev` after editing `.env.local`. Note: the panel needs *two* env vars — `CONTROL_PASSWORD` (login) and `CONTROL_SIGNING_KEY` (HMAC cookie). Both must be set.
