---
title: Handle a reported comment
sub: Moderation queue
---

**Symptom**: the control panel Dashboard shows unresolved report counts, or a user emailed support about abusive content.

## Find the report

`comment_reports` has no `status` column — reports are write-only signals. Recent reports pending human review are just recent rows.

```sql
SELECT
  cr.id AS report_id,
  cr.comment_id,
  cr.reporter_user_id,
  cr.reporter_fingerprint,
  cr.reason,
  cr.created_at,
  oc.user_id AS commenter_user_id,
  oc.author_name,
  oc.content AS comment_content,
  oc.shared_outfit_id,
  oc.is_hidden
FROM comment_reports cr
JOIN outfit_comments oc ON oc.id = cr.comment_id
ORDER BY cr.created_at DESC
LIMIT 50;
```

Comments already auto-hidden (`is_hidden = true` — happens after 3+ reports) can be filtered out or triaged separately.

## Judgment call

Read the comment. Compare against the community guidelines (no hate speech, no threats, no explicit sexual content, no spam). Decide:

- **Clear violation** → delete + block the commenter for the share owner.
- **Grey area** → leave the comment or hide it; consider warning the commenter (email via `auth.users.email`).
- **Not a violation** → no action.
- **Bot / spam** → delete + block + optionally disable the auth user.

## Delete the comment

```sql
DELETE FROM outfit_comments WHERE id = '<comment-id>';
```

CASCADE deletes any reports on it. Realtime broadcast fires; connected mobile clients on that shared outfit see it disappear.

## Hide instead of delete

If you want to keep the audit trail (e.g. legal request):

```sql
UPDATE outfit_comments SET is_hidden = true WHERE id = '<comment-id>';
```

Hidden comments are excluded from public reads but retained.

## Block the commenter from that share owner's outfits

For signed-in commenters:

```sql
INSERT INTO blocked_commenters (owner_user_id, blocked_user_id)
VALUES ('<share-owner-id>', '<commenter-user-id>')
ON CONFLICT DO NOTHING;
```

For anonymous web commenters (identified by fingerprint):

```sql
INSERT INTO blocked_commenters (owner_user_id, blocked_fingerprint)
VALUES ('<share-owner-id>', '<fingerprint-hash>')
ON CONFLICT DO NOTHING;
```

The share owner can also do this from the app themselves.

## Block from ALL shared outfits (nuclear option)

For serial abusers. There's no global-ban flag yet. Options:

**Ban the auth user** (they lose sign-in entirely):

```sql
-- via Supabase dashboard: Authentication → Users → find them → Ban duration
-- or via SQL as service role:
UPDATE auth.users SET banned_until = 'infinity' WHERE id = '<user-id>';
```

**Application-level flag** — not currently implemented. Add a `profiles.commenter_banned boolean` and check it in the comment insert path if this becomes recurring.

## Notify the reporter / commenter

Optional. No in-app notification for report resolution. You can email either via `auth.users.email` and a manual Resend send.

## Metrics to watch

- **Reports per shared outfit** — if one outfit is getting >5 reports, the outfit content itself might be the problem (owner is baiting).
- **Reports per reporter** — if one user is reporting a lot, might be over-reporting or targeting.
- **Auto-hide rate** — how many comments hit `is_hidden = true` via the 3-report trigger. If sustained high, tune the threshold or the pre-filter.

## Files

- `ch-backend-main/src/routes/sharing.routes.ts` — moderation endpoints.
- `ch-backend-main/src/utils/content-filter.ts` — profanity pre-filter at insert time.
- `ch-backend-main/src/db/schema.ts` — `commentReports`, `outfitComments`, `blockedCommenters` shapes.
