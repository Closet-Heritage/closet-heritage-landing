---
title: Unlock Smart Casual Weekend
sub: After the landing redeploy
---

Smart Casual Weekend is the 4th persona, intentionally gated dark until `closet-heritage-landing` redeploys with the 37 generated assets under `public/demo/{items,avatars,tryons}/smart-casual-weekend/`.

## Steps

**1. Verify all assets are reachable** (allow apex→www 307 redirect):

```bash
for sku in cream-oxford-shirt olive-henley heather-grey-tshirt \
           stone-chinos dark-wash-jeans charcoal-joggers \
           suede-chukka-boots canvas-sneakers brown-suede-loafers; do
  curl -sIL "https://closetheritage.com/demo/items/smart-casual-weekend/${sku}.png" \
    | grep -E '^HTTP|^location:'
done
curl -sIL "https://closetheritage.com/demo/avatars/smart-casual-weekend.png" | grep '^HTTP'
curl -sIL "https://closetheritage.com/demo/tryons/smart-casual-weekend/olive-henley__stone-chinos__suede-chukka-boots.png" | grep '^HTTP'
```

All should return HTTP 200 (via a 307 chain is fine).

**2. Flip the DB SKUs** — in the Supabase SQL editor:

```sql
UPDATE starter_clothing_skus SET active = TRUE
 WHERE persona_id = 'smart-casual-weekend';
```

Should return 9 rows.

**3. Flip the code constant** — edit `ch-backend-main/src/data/starter-wardrobe.ts`:

```diff
- active: false,
+ active: true,
```

The change is on the SCW entry inside `PERSONA_META`. Commit + deploy backend (Railway auto-deploys on push).

**4. Smoke test**:

- Sign in as a male TestFlight account.
- `GET /api/v1/wardrobe/starter-personas` should now include `smart-casual-weekend`.
- Seed it. Verify 9 items land in wardrobe with `source='starter'`.
- Confirm each item's `cropped_image_url` resolves (loads in the mobile app).

## Rollback

If anything goes wrong:

```sql
UPDATE starter_clothing_skus SET active = FALSE
 WHERE persona_id = 'smart-casual-weekend';
```

And revert the code change. Already-seeded users keep their items (no destructive cleanup needed) — they just can't be offered SCW to new users again.
