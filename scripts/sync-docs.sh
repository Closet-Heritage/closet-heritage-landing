#!/usr/bin/env bash
# Sync source-of-truth docs into content/docs/ so the control panel can render them.
#
# Only touches files that live outside this repo. Rewriting an in-repo doc via
# this script is not intended; edit the file under content/docs/ directly.

set -euo pipefail

LANDING_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ROOT="$(cd "$LANDING_ROOT/.." && pwd)"
BACKEND_ROOT="$PROJECT_ROOT/ch-backend-main"

DOCS="$LANDING_ROOT/content/docs"

echo "→ Syncing docs into $DOCS"

# Feature docs (external source of truth)
if [ -f "$BACKEND_ROOT/docs/starter-wardrobe-architecture.md" ]; then
  cp "$BACKEND_ROOT/docs/starter-wardrobe-architecture.md" "$DOCS/features/starter-wardrobe.md"
  echo "  ✓ features/starter-wardrobe.md ← starter-wardrobe-architecture.md"
fi

# Runbooks
if [ -f "$BACKEND_ROOT/docs/runbooks/starter-wardrobe.md" ]; then
  # The runbook covers multiple scenarios — split into individual doc pages.
  # For V1 we drop the whole file into a single runbook slug and reference it.
  # (The docs-config.ts breakdown lists individual runbook slugs; those are
  # authored fresh under content/docs/runbooks/.)
  echo "  · runbook source available at $BACKEND_ROOT/docs/runbooks/starter-wardrobe.md"
fi

# Session log (PROGRESS.md) — informational only, not linked from TOC.
if [ -f "$PROJECT_ROOT/PROGRESS.md" ]; then
  cp "$PROJECT_ROOT/PROGRESS.md" "$DOCS/PROGRESS.md.snapshot"
  echo "  ✓ PROGRESS.md.snapshot (reference copy, not linked in TOC)"
fi

# GO-LIVE checklist — informational.
if [ -f "$PROJECT_ROOT/GO-LIVE-CHECKLIST.md" ]; then
  cp "$PROJECT_ROOT/GO-LIVE-CHECKLIST.md" "$DOCS/GO-LIVE-CHECKLIST.md.snapshot"
  echo "  ✓ GO-LIVE-CHECKLIST.md.snapshot (reference copy)"
fi

echo "→ Done."
