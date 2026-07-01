'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAudit, requireSession } from '../audit';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPO_TOKEN_RE = /^ExponentPushToken\[|^ExpoPushToken\[/;

/**
 * Fan out a push notification to every registered device.
 *
 * Reads `user_push_tokens` directly (via service role), chunks into batches
 * of 100 (Expo push API limit), and POSTs each batch to Expo's push endpoint.
 * The Expo response has per-ticket status (`ok` | `error`) — we count each
 * one individually AND clean up tokens returned as `DeviceNotRegistered` so
 * they don't clog future broadcasts.
 *
 * Deep-link contract: mobile reads `data.screen` (and companion IDs) — see
 * `usePushNotifications.ts` in the mobile repo. Free-form `url` fields are
 * silently ignored by the current handler; the form only exposes `screen`.
 *
 * Every send is audited with the summary of Expo's response so we can debug
 * delivery. Missing EXPO_ACCESS_TOKEN is also audited (not silently sent).
 */
export async function broadcastPushAction(input: {
    title: string;
    body: string;
    /** Mobile screen slug — e.g. 'daily-recs' | 'outfits' | 'wardrobe'. Mapped to `data.screen`. */
    screen?: string;
    /** If empty → all tokens. Otherwise only these user IDs. Non-UUID entries are rejected. */
    userIds: string[];
    dryRun: boolean;
}) {
    const session = await requireSession();

    // Server-side input validation (defense in depth vs. client caps).
    const title = input.title?.trim().slice(0, 65) ?? '';
    const body = input.body?.trim().slice(0, 240) ?? '';
    if (!title || !body) {
        return { ok: false as const, error: 'Title and body are required' };
    }

    const invalidUuids = input.userIds.filter((u) => u && !UUID_RE.test(u.trim()));
    if (invalidUuids.length > 0) {
        return { ok: false as const, error: `Invalid user ID${invalidUuids.length > 1 ? 's' : ''}: ${invalidUuids.slice(0, 3).join(', ')}${invalidUuids.length > 3 ? '…' : ''}` };
    }
    const cleanUserIds = Array.from(new Set(input.userIds.map((u) => u.trim()).filter(Boolean)));

    const sb = supabaseAdmin();
    let q = sb.from('user_push_tokens').select('user_id, expo_push_token, platform');
    if (cleanUserIds.length > 0) q = q.in('user_id', cleanUserIds);
    const { data: tokens, error: tokenErr } = await q;
    if (tokenErr) {
        await logAudit(session, {
            action: 'broadcast.push',
            details: { title, body, screen: input.screen, targetedCount: 0 },
            ok: false,
            error: `Failed to read tokens: ${tokenErr.message}`,
        });
        return { ok: false as const, error: `Failed to read tokens: ${tokenErr.message}` };
    }

    // Keep the token → row mapping so we can prune DeviceNotRegistered rows later.
    type TokenRow = { user_id: string; expo_push_token: string; platform: string | null };
    const rows: TokenRow[] = (tokens ?? [])
        .map((t) => ({ user_id: t.user_id as string, expo_push_token: (t.expo_push_token as string) ?? '', platform: (t.platform as string | null) ?? null }))
        .filter((t) => EXPO_TOKEN_RE.test(t.expo_push_token));

    if (rows.length === 0) {
        await logAudit(session, {
            action: 'broadcast.push',
            details: { title, body, screen: input.screen, targetedCount: 0, dryRun: input.dryRun },
            ok: false,
            error: 'No tokens matched',
        });
        return { ok: false as const, error: 'No push tokens matched your filter' };
    }

    if (input.dryRun) {
        await logAudit(session, {
            action: 'broadcast.push.dry_run',
            details: { title, body, screen: input.screen, tokenCount: rows.length },
        });
        return {
            ok: true as const,
            dryRun: true,
            targetedCount: rows.length,
            sent: 0,
        };
    }

    // Refuse to actually send when the Expo access token is missing. Unsigned
    // requests hit stricter Expo rate limits (~600/hr) — for a real broadcast
    // that's almost certainly wrong. Dry run above is still permitted so ops
    // can test the input path without configuring the env.
    const expoToken = process.env.EXPO_ACCESS_TOKEN;
    if (!expoToken) {
        await logAudit(session, {
            action: 'broadcast.push',
            details: { title, body, screen: input.screen, targetedCount: rows.length, envMissing: true },
            ok: false,
            error: 'EXPO_ACCESS_TOKEN not configured',
        });
        return { ok: false as const, error: 'EXPO_ACCESS_TOKEN is not configured — set it in .env.local and restart' };
    }

    // Expo Push accepts up to 100 messages per request.
    const CHUNK = 100;
    let sent = 0;
    let failed = 0;
    let firstError: string | undefined;
    const deadTokens: string[] = [];

    // Payload data — only include `screen` when the caller set one, matching
    // the sanctioned mobile contract (see hooks/usePushNotifications.ts).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataPayload: Record<string, any> = {};
    if (input.screen) dataPayload.screen = input.screen;

    for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const messages = chunk.map((r) => ({
            to: r.expo_push_token,
            sound: 'default',
            title,
            body,
            data: Object.keys(dataPayload).length > 0 ? dataPayload : undefined,
        }));
        try {
            const res = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Authorization': `Bearer ${expoToken}`,
                },
                body: JSON.stringify(messages),
                signal: AbortSignal.timeout(30000),
            });
            const responseBody = await res.json().catch(() => ({}));

            if (!res.ok || !responseBody?.data) {
                // Whole-batch failure — count every message failed, keep the
                // first upstream error string for the audit.
                failed += chunk.length;
                if (!firstError) firstError = `HTTP ${res.status}: ${JSON.stringify(responseBody).slice(0, 200)}`;
                continue;
            }

            // Per-ticket parse. Expo returns an array aligned to `messages`.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tickets = responseBody.data as Array<any>;
            for (let j = 0; j < tickets.length; j++) {
                const t = tickets[j];
                const row = chunk[j];
                if (t?.status === 'ok') {
                    sent += 1;
                } else {
                    failed += 1;
                    if (!firstError) firstError = t?.message ?? t?.details?.error ?? 'unknown ticket error';
                    // Prune tokens Expo tells us are gone. Also handles the
                    // Apple/Google-side "you should stop sending" signal.
                    if (t?.details?.error === 'DeviceNotRegistered' || t?.details?.error === 'InvalidCredentials') {
                        deadTokens.push(row.expo_push_token);
                    }
                }
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            failed += chunk.length;
            if (!firstError) firstError = msg;
        }
    }

    // Best-effort dead-token cleanup. Silent on error — this is bookkeeping.
    let prunedCount = 0;
    if (deadTokens.length > 0) {
        const { error: delErr, count } = await sb
            .from('user_push_tokens')
            .delete({ count: 'exact' })
            .in('expo_push_token', deadTokens);
        prunedCount = count ?? 0;
        if (delErr) console.error('[broadcast] token prune failed:', delErr.message);
    }

    await logAudit(session, {
        action: 'broadcast.push',
        details: {
            title,
            body,
            screen: input.screen,
            targetedCount: rows.length,
            sent,
            failed,
            firstError,
            pruned: prunedCount,
        },
        ok: failed === 0,
        error: failed > 0 ? firstError : undefined,
    });

    return {
        ok: true as const,
        dryRun: false,
        targetedCount: rows.length,
        sent,
        failed,
        firstError,
        pruned: prunedCount,
    };
}
