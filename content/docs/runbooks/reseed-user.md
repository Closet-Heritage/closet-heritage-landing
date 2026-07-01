---
title: Re-seed a stuck user
sub: When their starter claim was orphaned
---

**Symptom**: user reports they never got their starter wardrobe, but the app / server says they did (`starter_wardrobe_seeded_at` is not null).

## Diagnose

Query the profile:

```sql
SELECT
  id,
  full_name,
  starter_wardrobe_seeded_at,
  starter_persona_id,
  starter_avatar_persona_id,
  (SELECT COUNT(*) FROM clothing_items
     WHERE user_id = profiles.id AND source = 'starter') AS starter_item_count
FROM profiles
WHERE id = '<user-uuid>';
```

Interpret:

- **`starter_wardrobe_seeded_at IS NOT NULL` and `starter_item_count = 0`** → the transactional claim happened but the INSERT step failed. This is the "orphaned claim" state. **Recovery below**.
- **`starter_item_count > 0`** → items exist. User is confused or looking at a filtered view (archived, category chip). No server-side action needed. Ask them to check the Wardrobe tab with no filters.
- **`starter_persona_id IS NULL` but `starter_item_count > 0`** → items exist but the profile flag is missing. Impossible under current code (would mean someone hand-INSERTed items). Investigate.

## Recover — clear the orphan claim

```sql
UPDATE profiles
   SET starter_wardrobe_seeded_at = NULL,
       starter_persona_id = NULL,
       starter_avatar_persona_id = NULL
 WHERE id = '<user-uuid>';
```

The user can now pick a persona again. Their app may need a re-open + reset to fetch the fresh profile — usually happens on the next Home render because we invalidate on focus.

## If the user also has a broken avatar

If they picked "also_use_avatar" during the orphan claim and the avatar column was set but then unused:

```sql
UPDATE profiles SET avatar_url = NULL WHERE id = '<user-uuid>';
```

They'll re-do the avatar step. Careful: only do this if the user confirmed they don't want the persona stand-in avatar. Otherwise deleting the URL would look identical from the mobile side as "you have no avatar", not "you had a stand-in".

## Why does this happen

The seed pipeline is:

```
1. tx begin
2. UPDATE profiles SET starter_wardrobe_seeded_at = NOW(),
                       starter_persona_id = ?, ...
   WHERE id = ? AND starter_wardrobe_seeded_at IS NULL   ← claim
3. INSERT 9 clothing_items rows
4. tx commit
```

If step 3 fails after step 2's claim succeeded, the transaction rolls back and everything is atomic. But historically some code paths lived outside the transaction — Session 15's R-AB review fixed most of these. If you see this state in production, verify the current code path is fully-transactional and file a bug.

## When to NOT re-seed

- If the user is on a paying plan and has since built up items and outfits, **do not** delete their existing starter items. They may have grown attached. Just unset the profile flag and let them pick again if they want — the new seed will duplicate items but that's their problem.
- If the user is complaining that their starter items were removed by Bulk Delete, they can't be recovered. Point them at Settings → Remove starter wardrobe next time if they wanted to keep some.

## Files

`ch-backend-main/src/routes/wardrobe.routes.ts` → `seedStarterHandler`. Review recent commits if a new bug appears.
