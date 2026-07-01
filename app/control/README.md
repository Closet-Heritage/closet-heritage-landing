# Control panel

Operations + docs UI for the CEO and CTO. Password-gated route at `/control`.

## Setup

Add to `.env.local`:

```
# Auth (both required)
CONTROL_PASSWORD=<32+ char random string>          # shared login password
CONTROL_SIGNING_KEY=<32+ char random string>       # HMAC cookie signing key (do NOT reuse CONTROL_PASSWORD)

# Optional
CONTROL_SESSION_VERSION=1                          # bump to invalidate all live sessions

# Supabase service role (required — for admin reads, bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=<from ch-backend .env.local>

# Backend health ping (optional — used only by /control/system)
NEXT_PUBLIC_BACKEND_URL=https://api.closetheritage.com
```

Generate secrets:

```bash
openssl rand -hex 32
```

## Auth

- Login: `/control/login`. Enter your **name** and the shared `CONTROL_PASSWORD`.
- **Role is assigned server-side** by name via `roleForName()` in `lib/control-auth.ts`. Not selectable from the form. Current mapping: Patience → `owner` (CEO), Ryan → `engineer` (CTO), anyone else → `engineer`. Matching is case-insensitive and uses just the first token (so "Patience Boateng" still maps to owner).
- Cookie: `ch_control_token` — HMAC-signed session, 7-day TTL, embeds `role`, `name`, `iat`, `exp`, and a session version.
- Middleware in `middleware.ts` gates every `/control/*` route except `/control/login`.

## Panic logout everyone

Bump `CONTROL_SESSION_VERSION` (default 1). Every live session becomes invalid on next request; everyone re-logs-in. Cheaper than rotating `CONTROL_SIGNING_KEY`.

## Pages

- **Dashboard** (`/control`) — Needs-you queue, Pulse metrics, live activity feed.
- **Users** (`/control/users`, `/control/users/[id]`) — Search + detail (profile, wardrobe, subs, coins, payments).
- **System** (`/control/system`) — Env vars, Supabase table counts, backend health ping.
- **Docs** (`/control/docs`) — 34-page developer-onboarding docs portal.

## Docs source

Every doc lives as a markdown file under `content/docs/<section>/<slug>.md`. The table of contents is authored in `app/control/docs-config.ts`. Renderer in `app/control/(authed)/docs/[section]/[slug]/page.tsx` reads via `docs-loader.ts` (uses `gray-matter` + `marked`, sanitizes with `isomorphic-dompurify`).

To edit a doc:
1. Open the `.md` file, edit, save.
2. If it's an external source (like `ch-backend-main/docs/*.md`), edit there first then run `bash scripts/sync-docs.sh` to sync copies.

To add a new doc:
1. Create the `.md` file with frontmatter (`title`, `sub`).
2. Add an entry to `docs-config.ts` in the appropriate section.

## Data queries

All Supabase queries live in `app/control/queries.ts`. Server-only. Uses the service-role client that bypasses RLS. Keep this file as the single choke point for auditability.

## Making changes

- **New page**: add to `app/control/(authed)/<segment>/page.tsx` and add a link in `ControlShell.tsx`'s `NAV_ITEMS`.
- **New role gating** (rarely needed for a 2-person team): set `roles: ['owner']` on the nav entry AND wrap the server action with a session-role check. Currently both roles have full access.
- **New docs**: see above.

## Deploy

Pushes to `main` deploy to Vercel. Set `CONTROL_PASSWORD`, `CONTROL_SIGNING_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's project env vars. Use different values than local so a local secret leak doesn't compromise production.
