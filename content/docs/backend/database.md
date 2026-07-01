---
title: Database schema
sub: Drizzle, migrations, RLS
---

## Source of truth

- **`src/db/schema.ts`** — Drizzle table definitions. This is the code source of truth.
- **`drizzle/*.sql`** — Auto-generated migrations from `schema.ts`.
- **`supabase/migrations/*.sql`** — Hand-authored SQL for RLS policies, triggers, and seed data that Drizzle can't express cleanly.

## Migration workflow

**Adding a new column** (Drizzle handles it):
```bash
# 1. Edit src/db/schema.ts
# 2. Generate migration
npx drizzle-kit generate
# 3. Review the SQL file in drizzle/
# 4. Apply
npx drizzle-kit push
# ... or via Supabase MCP if drizzle-kit push times out
```

**Adding an RLS policy or trigger** (Drizzle can't):
```bash
# 1. Hand-write SQL in supabase/migrations/NNN_description.sql
# 2. Apply via Supabase MCP execute_sql (or dashboard editor)
# 3. Commit both the .sql file AND update schema.ts's pgPolicy(...) call
#    so drizzle's snapshot doesn't drift
```

## Applied migrations (production)

Check `supabase_migrations.schema_migrations` in production for the authoritative list. Local files in `supabase/migrations/`:

- `001_triggers_and_realtime.sql` — `handle_new_user`, `moddatetime`, Realtime publications.
- `002_handle_new_user_daily_recs.sql` — Daily recs defaults on signup.
- `003_starter_wardrobe.sql` — Starter table + columns + RLS + `guard_profile_starter_columns` trigger.

Applied out-of-band via Supabase MCP (not in `supabase/migrations/` yet — see PROGRESS.md session 15 note): `starter_wardrobe_security_lockdown_v2`.

## Row-Level Security (RLS)

Every user-owned table has RLS enabled. The canonical pattern:

```sql
CREATE POLICY "Users can view own X" ON <table>
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own X" ON <table>
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own X" ON <table>
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own X" ON <table>
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

## Special RLS cases

**`clothing_items` — starter immutability.** INSERT/UPDATE `WITH CHECK` clauses include `source = 'user' AND starter_sku_id IS NULL`. DELETE `USING` requires `source = 'user'`. Rationale: starter rows are shared curated data; authenticated clients must not counterfeit or mutate them, and single-item deletion of a starter would strand the user in an "orphan persona" state. Bulk removal goes through `DELETE /wardrobe/starter` (backend, service role).

**`profiles.starter_*` — trigger guard.** `guard_profile_starter_columns` BEFORE UPDATE raises `42501` when the authenticated role (checked via `current_setting('request.jwt.claims', true)::jsonb->>'role'`) attempts to modify any of the four `starter_*` columns. Bypassed for `postgres` / `service_role` connections.

**`starter_clothing_skus` — public read.** RLS is enabled but has a single `USING (TRUE)` policy for authenticated clients. Writes are admin-only (via service role); no INSERT/UPDATE/DELETE policy exists.

## Triggers

- **`handle_new_user`** (auth schema) — On INSERT into `auth.users`, inserts a `profiles` row with defaults, initial `daily_recs_hour=7`, `re_engagement_tier=0`.
- **`moddatetime`** — Updates `updated_at` on any table with that column.
- **`guard_profile_starter_columns`** — RLS-style enforcement for the four `starter_*` columns.

## Indexes worth knowing

Beyond primary keys and Drizzle auto-generated FK indexes:

```sql
CREATE INDEX idx_clothing_items_user_category ON clothing_items(user_id, top_category, category);
CREATE INDEX idx_clothing_items_source ON clothing_items(user_id, source, archived);
CREATE INDEX idx_outfits_user_planned ON outfits(user_id, planned_date);
CREATE INDEX idx_upload_batches_user ON upload_batches(user_id, created_at);
CREATE INDEX idx_starter_clothing_skus_persona ON starter_clothing_skus(persona_id, active);
```

Full list in `src/db/indexes.sql` + inline `index()` calls in `schema.ts`.

## Storage buckets

Only one: **`clothing-images`**. Subfolders:

- `originals/<userId>/<batchId>-<n>.jpg` — raw upload from the phone
- `cropped/<userId>/<itemId>.jpg` — background-removed per-item image
- `processed/<userId>/...` — intermediate outputs (rarely accessed)
- `grids/<userId>/<batchId>.jpg` — AI-generated composite
- `avatars/<userId>.jpg` — the user's body photo used for try-on
- `tryons/<userId>/<random>.png` — generated try-on results

Bucket is private. Signed URLs (7-day) are returned to the client. Public URLs are used only for starter items (they live on the landing site's CDN, not Storage).

## Realtime

Postgres Changes are enabled on: `outfit_comments`, `outfit_reactions`, `blocked_commenters`. The mobile app subscribes when the user opens a shared outfit; server writes fan out.

Requires `REPLICA IDENTITY FULL` on the table + explicit publication in `supabase_realtime`. Set in `001_triggers_and_realtime.sql`.
