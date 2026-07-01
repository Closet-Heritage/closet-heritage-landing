---
title: Outfit matching
sub: How suggestions are picked (pure algorithm — no AI)
---

**The outfit matcher does not use AI.** It is a deterministic algorithm — a fancy sorting exercise. AI was used earlier, when the user's clothes were photographed and tagged. By the time we suggest outfits, every item already has a color, pattern, style, occasion tag, and season attached. The suggester is pure math.

That is why it is instant, free (no coin cost), and identical for the same inputs (modulo intentional shuffling).

## 30-second summary

1. **User taps "Suggest"** with filters (occasion, weather, vibe, colors, duration, count).
2. **Backend loads their closet** and buckets items into six categories: tops, bottoms, dresses, shoes, outerwear, accessories.
3. **Filters apply in order**: occasion → recently-worn → weather → vibe → colors.
4. **Combinations are generated** — nested loop over tops × bottoms × shoes (or dress × shoes), plus optional layers and headwear. Capped at 100.
5. **Every combination is scored** by color harmony + vibe compatibility + matching-set bonus + completeness bonus.
6. **Tiered shuffle** — excellent (≥0.8), good (0.6–0.8), acceptable (<0.6). Randomise within tiers, keep tier order.
7. **Diversify the final selection** — one of each color-harmony label first (Classic, Bold, Fresh…), then top-of-list.
8. **Dismissed combinations are removed** — anything the user previously swiped away.
9. **Response returned** with `label`, `harmony`, `score`, and the items per slot.

Typical wall clock: **100–400 ms** for a 50-item closet.

## The buckets (six per user)

Items are categorized by `categorizeItem()` in `outfit.service.ts:151`:

- **tops** — T-shirt, Shirt, Blouse, Tank Top, Polo, Crop Top, Tunic, Dashiki Top, Kaftan Top, Senator Top
- **bottoms** — Trousers, Jeans, Skirt, Shorts, Joggers, Wrapper
- **dresses** — Dress, Kaftan, Boubou, Dashiki, Kente Cloth, Ankara Dress
- **shoes** — everything under Footwear
- **outerwear** — Jacket, Coat, Blazer, Vest, Parka, Hoodie, Cardigan, Sweater, Denim Jacket, Agbada
- **accessories** — Headwear only (Hat, Headwrap, Gele, Kufi, Turban); bags removed from taxonomy

## Filters, in order

### 1. Occasion (family-based)

Occasions belong to families:

- **Formal**: Church/Religious, Formal, Work/Office, Wedding, Interview, Traditional Ceremony, Funeral
- **Smart-casual**: Casual, Party
- **Active**: Athletic/Gym, Beach
- **Comfort**: Loungewear

Same family = compatible. Some occasions bridge families (Date Night draws from both formal + smart-casual). Category exclusions (`FAMILY_CATEGORY_EXCLUSIONS`) remove items regardless of tags — e.g. sneakers, tank tops, and joggers are never offered for a formal wedding.

If the filter leaves too few items, the response includes `canRetryRelaxed: true` so the mobile client can offer "try again without occasion restriction".

### 2. Recently worn (optional)

If enabled, items in outfits saved in the last 7 days are removed from the pool. Skipped if the filter leaves an empty wardrobe.

### 3. Weather → season

- Hot → Summer, All Season
- Warm / Mild → Spring, Fall, All Season
- Cool → Fall, Winter, All Season
- Cold → Winter, All Season

Items with no season tag are assumed all-season and always pass. Auto-relaxes if the filter is too aggressive.

### 4. Vibe

Six vibes: Classic, Afrocentric, Bold, Relaxed, Minimalist, Any. Each defines a `VibeFilter` with allowed styles + patterns. Solid items always pass (they don't fight anything) so pairings still work.

If the vibe filter empties the wardrobe, we reset to full and re-apply occasion + weather, warning the user "limited options in that vibe, showing all styles".

### 5. Color preferences (informational only)

Color preferences don't filter — they inform scoring. But if any preferred color has *zero* items, we surface a warning ("no red items in your wardrobe").

## Combination generation

`generateCombinations()` in `outfit.service.ts:773`. Nested loop:

- If `outfitType` is `separates` or `any`: for each top, for each bottom, for each shoe (+undefined shoeless variant), push a combo.
- If `outfitType` is `fullOutfits` or `any`: for each dress, for each shoe, push.
- If both are possible, reserve ~30% of the 100-combo budget for dresses so separates don't flood.

Then add optional layers to ~50% of combos, add optional headwear to ~30% of combos.

Layer subtleties:
- Skipped entirely in hot weather.
- Skipped when the base garment is already long-sleeve (redundant).
- Closed outerwear (pullover hoodies/sweaters without zip or button) only in cool/cold weather — they hide the outfit and the try-on prompt insists they stay closed.
- Anchored outerwear overrides these rules and is forced onto every combo.

## Anchor items

Users pin one or more items with "Plan outfit with this". Anchored items:

- Replace their whole bucket (only that item is a candidate in that slot).
- Bypass matching-set / occasion / weather filters.
- If anchored dress: `outfitType` is forced to `fullOutfits`.
- If a dress and a top are both anchored, dress wins.

## Scoring

`scoreCombination()` in `outfit.service.ts:951`. Every combination gets a score 0–1 built from:

**A. Color harmony** (`scoreOutfitColors`). Colors bucket into neutrals / warm / cool. Pairwise compatibility:

| Pair | Score |
|---|---|
| Same colour | 0.95 |
| Neutral + anything | 0.9 |
| Same family | 0.8 |
| Warm + cool | 0.6 |
| Unknown | 0.7 |

Averaged. Gets a **label**: Classic, Timeless, Polished, Vibrant, Fresh, Refined, Warm, Sunset, Cozy, Cool, Serene, Ocean, Bold, Dynamic, Statement, Balanced, Eclectic, Artistic — deterministically chosen from color distribution.

**B. Vibe pattern compatibility** (`scorePatternCompatibility`). Count bold patterns:

| Bold patterns | Score | Warning |
|---|---|---|
| 0 | 100 | none |
| 1 | 100 | none (statement piece — ideal) |
| 2 | 50 | may clash |
| 3+ | 20 | too many |

Afrocentric vibe has its own scorer: 1 African print + solid neutrals = 100 (ideal). Multiple African prints = 30 (too busy).

**C. Color preference match** — % of preferred colors present in the combo.

**Combined**: 60% color + 40% vibe (or 40/30/30 if color preferences set).

**Bonuses**:

- **+0.05** if the outfit has shoes (completeness).
- **+0.25** if top+bottom (or outerwear+bottom) share a `matching_set_id`.

## Tiered shuffle

Sort by score, split into three tiers (≥0.8, 0.6–0.8, <0.6), shuffle *within* each tier, stack in tier order. Excellent options are always first — but *which* excellent one is at position #1 changes between generations. Feature, not bug.

## Diversify

`diversifyResults()` picks N results:

- **Pass 1**: one of each color-harmony label. Ensures 5 suggestions aren't all "Classic".
- **Pass 2**: fill the rest from the top of the ranking, skipping duplicates.

Single-day repetition controls let the user forbid the same item from appearing in multiple daily alternatives. Shoe repetition is a separate switch (users often want the same pair to reappear).

## Multi-day mode

For a 3-day trip, the pipeline runs once per day with an additional filter: **repetition gap** based on the user's rule (`always`, `after1day`, `after2days`, `after3days`, `after4days`, `never`). Anchors are exempt. Each day's picks feed forward into the next day's `usedItemsMap`.

## Dismissed combinations

Every swipe-away writes item IDs to `dismissed_outfits.item_combination`. Before scoring, we filter out any combination that *contains* every item from a dismissed set — subset match, not exact. So dismissing "these boots + these jeans" blocks that pairing even when the top rotates.

## Files you'd touch

| Concern | File |
|---|---|
| The whole algorithm | `src/services/outfit.service.ts` |
| Occasion families | `src/utils/occasion-compatibility.ts` |
| Vibes + patterns + Afrocentric | `src/utils/vibe-filters.ts` |
| Color families + harmony labels | `src/utils/color-matching.ts` |
| Taxonomy (subcategories, categories) | `src/utils/taxonomy.ts` |
| Mobile screen | `app/plan-outfit/results.tsx` |
| Mobile hook | `hooks/useOutfits.ts` (`useGenerateOutfits`) |
