---
title: Wardrobe + AI pipeline
sub: Photo → tagged, croppable items
---

The wardrobe upload flow is the app's most AI-intensive path. A user takes 1–5 photos of their clothes (on a bed, hanging, in a drawer), taps upload, and 30–90 seconds later has fully tagged individual items in their closet.

## Stages, at a glance

```
Photo (up to 5)
   ↓ [MOBILE] compress + upload to Storage originals/
   ↓
POST /ai/tag-clothing (batchId, urls, gender)
   ↓ [BACKEND]
   ┌─────────────────────────────────────────────────┐
   │ Per photo:                                      │
   │   1. Validate photo (Gemini 3 Flash Preview)              │  ← "is this clothes?"
   │   2. Generate grid (Gemini 3.1 Flash Image)     │  ← composite on clean bg
   │   3. Tag grid (Gemini 3 Flash Preview text)               │  ← per-item metadata
   │   4. Crop items from grid                       │  ← sharp
   │   5. Verify crops vs original (Gemini 3 Flash Preview,    │  ← hallucination guard
   │      chain-of-thought)                          │
   │   6. Re-extract failed items (Flash Image,      │  ← dual reference
   │      dual reference: original + grid crop)      │
   │   7. Compare re-extracted vs grid crop          │  ← keep better version
   │      (Flash text)                               │
   │   8. Background-remove + upload                 │
   └─────────────────────────────────────────────────┘
   ↓
INSERT into clothing_items with tags + cropped URL
   ↓
Update upload_batches: status='completed', items_detected=N
   ↓ [MOBILE] Poll batch status → done → refresh wardrobe
   ↓
User sees new items in the Wardrobe tab
```

Total cost: **~$0.08–0.10 per photo** (verification is the big driver). Total time: **30–90 seconds** per photo depending on model latency.

## Stage 1 — validate the photo

Gemini 3 Flash Preview (vision) reads the photo and returns a structured JSON via `photoValidationSchema`. Answers:

- Is it clothes at all? (Reject "photo of my dog".)
- Are the items spread, piled, or mixed?
- Rough count of visible items.
- Are there people in the shot? (Should not be — user should photograph clothes alone.)

If it fails validation, the batch marks that photo as `rejected` and skips to the next one. If all photos fail, the batch fails and the mobile client shows an error with an actionable hint ("try again with clothes spread on a bed").

## Stage 2 — generate a "grid"

Gemini 3.1 Flash Image (image gen) is prompted with:

```
Compose the clothing items from this photo as a clean grid on a neutral background,
one item per cell, isolated, high resolution.
```

The output is a single new image where the items are neatly separated. This is easier to crop mechanically than the original messy bed photo.

Cost: **~$0.039 / image**.

## Stage 3 — tag the grid

Gemini 3 Flash Preview (text + vision) reads the grid and returns structured JSON per item:

```json
{
  "items": [
    {
      "index": 0,
      "name": "Cream oxford shirt",
      "top_category": "Clothing",
      "category": "Tops",
      "subcategory": "Oxford Shirt",
      "primary_color": "Cream",
      "colors": ["Cream", "White"],
      "material": "Cotton",
      "pattern": "Solid",
      "style": "Classic",
      "occasion": ["Work/Office", "Casual"],
      "season": ["Spring", "Fall", "All Season"],
      "gender": "Men",
      "attributes": {
        "sleeveLength": "Long Sleeve",
        "neckline": "Point Collar",
        "closure": "Button",
        "fit": "Regular"
      }
    },
    ...
  ]
}
```

Field values must match `utils/taxonomy.ts` — the outfit matcher, vibe filters, and try-on prompt all rely on these exact strings.

Zod pre-processes string→array for `season`/`occasion` because Gemini sometimes returns a scalar when there's only one value.

## Stage 4 — crop from the grid

Uses `sharp` to cut each item's bounding box out of the grid image. No AI needed — bounding boxes come from stage 3's response.

## Stage 5 — verify (hallucination-aware)

This is the safety layer. Gemini 3 Flash Preview is shown *both* the cropped item and the original photo, and asked: "is this cropped item actually present in the original?" It reasons step by step (chain-of-thought) and returns a boolean.

If the model claims the crop *does not* match the original, we flag that item for re-extraction. This catches cases where stage 2's grid generation invented items that weren't there.

A count mismatch (grid claims 8 items, verify says only 6 are in the original) triggers warnings but doesn't hard-fail — the extra items get demoted.

## Stage 6 — re-extract failed items

Gemini 3.1 Flash Image with a dual reference: both the original photo and the grid crop. Prompt asks for a cleaner extraction of just this item. Costs another ~$0.039 per attempt.

## Stage 7 — compare re-extracted vs grid crop

Gemini Flash text asks: "which of these two crops better represents the original item?" Whichever wins becomes the final image.

## Stage 8 — background removal + upload

`@imgly/background-removal-node` runs locally on the backend server (no external API). Falls back to remove.bg API if `REMOVEBG_API_KEY` is set. Final image is uploaded to `cropped/<userId>/<itemId>.jpg`.

## Landing in `clothing_items`

Each item becomes a row with `source='user'`, `starter_sku_id=NULL`, `archived=false`, `needs_review=<flag>` (true if verification was borderline). RLS policy allows the user to see + edit their own items.

## Regenerating / re-extracting

The user can hit "Re-extract" on any item's detail screen to run stages 6+7+8 again with a different seed. Capped at 2 regenerations per item (`MAX_REGENERATIONS`).

## Duplicate detection

Before inserting, `duplicate-detection.service.ts` checks if a similar item already exists in the user's wardrobe (same subcategory + primary color + similar attributes). If so, the mobile UI shows a "these look like duplicates — merge?" sheet.

Starter items are excluded from the duplicate-detection candidate pool (a user's real cream oxford shirt should not match a starter cream oxford shirt).

## When it breaks

Common failure modes and where to look:

| Symptom | Probable cause | Where to look |
|---|---|---|
| Batch stuck on 'processing' for >5 min | Gemini rate limit / outage | Backend pino logs; check `workflow.service.ts (+ grid-generation.service.ts + tagging.service.ts)` for the last stage logged |
| Items missing after upload | Verification stage killed them | Check `needs_review` flag; re-extract manually |
| Wrong tags on items | Gemini misread | User edit via item detail; feedback loop is manual |
| BG removal fails silently | `@imgly` model not pre-loaded | Server startup log should show `✅ @imgly background removal model pre-loaded` |
