'use server';

import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAudit, requireSession } from '../audit';

/**
 * Derive a deterministic idempotency key from the grant inputs so any retry
 * within the same minute-bucket collapses to the same key at RevenueCat.
 *
 * A double-click, a browser-retried POST, or a modal-reopen after a slow
 * response all produce the same key → RC accepts once, returns cached
 * result on repeats. Bucket rolls forward every minute, so a deliberate
 * re-grant a minute later works.
 */
function grantIdempotencyKey(userId: string, amount: number, reason: string, actor: string): string {
    const bucket = Math.floor(Date.now() / 60_000);
    const hash = createHash('sha256')
        .update(`${userId}|${amount}|${reason.trim()}|${actor}|${bucket}`)
        .digest('hex')
        .slice(0, 32);
    return `panel-grant-${hash}`;
}

/**
 * Grant (or claw back) coins to a user via RevenueCat V2 Virtual Currency.
 * Positive `amount` deposits; negative debits.
 *
 * The RC secret key + project ID live in env. If they're missing we return
 * a clear error AND audit the miss — money-adjacent actions must never
 * silently no-op.
 */
export async function grantCoinsAction(userId: string, amount: number, reason: string) {
    const session = await requireSession();
    if (!Number.isFinite(amount) || amount === 0) {
        return { ok: false as const, error: 'Amount must be a non-zero number' };
    }
    if (!reason.trim()) {
        return { ok: false as const, error: 'A reason is required for the audit log' };
    }

    const secret = process.env.REVENUECAT_SECRET_KEY;
    const projectId = process.env.REVENUECAT_PROJECT_ID;
    if (!secret || !projectId) {
        await logAudit(session, {
            action: amount > 0 ? 'user.grant_coins' : 'user.debit_coins',
            targetType: 'user',
            targetId: userId,
            details: { amount, reason, envMissing: true },
            ok: false,
            error: 'REVENUECAT_SECRET_KEY / REVENUECAT_PROJECT_ID not configured',
        });
        return { ok: false as const, error: 'RevenueCat env vars missing (REVENUECAT_SECRET_KEY, REVENUECAT_PROJECT_ID)' };
    }

    // Deterministic idempotency key — inputs + actor + minute-bucket. Double-
    // clicks and browser retries collapse into a single RC transaction.
    const idempotencyKey = grantIdempotencyKey(userId, amount, reason, session.name);
    const url = `https://api.revenuecat.com/v2/projects/${projectId}/customers/${encodeURIComponent(userId)}/virtual_currencies/transactions`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secret}`,
                'Content-Type': 'application/json',
                // RC V2 uses the RFC 8594 idempotency header name — NOT the
                // legacy `X-Idempotency-Key`. The wrong name is silently
                // ignored by RC, defeating the guard entirely.
                'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify({
                adjustments: { COIN: amount },
            }),
            signal: AbortSignal.timeout(15000),
        });
        const body = await res.json().catch(() => ({}));
        const ok = res.ok;

        await logAudit(session, {
            action: amount > 0 ? 'user.grant_coins' : 'user.debit_coins',
            targetType: 'user',
            targetId: userId,
            details: { amount, reason, idempotencyKey, response: body },
            ok,
            error: ok ? undefined : (body?.message ?? `HTTP ${res.status}`),
        });

        if (!ok) return { ok: false as const, error: body?.message ?? `RC responded ${res.status}` };

        revalidatePath(`/control/users/${userId}`);
        return { ok: true as const };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await logAudit(session, {
            action: amount > 0 ? 'user.grant_coins' : 'user.debit_coins',
            targetType: 'user',
            targetId: userId,
            details: { amount, reason, idempotencyKey },
            ok: false,
            error: msg,
        });
        return { ok: false as const, error: msg };
    }
}

/** Ban a user (100y = effectively permanent). Owner-only. */
export async function banUserAction(userId: string) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb.auth.admin as any).updateUserById(userId, {
        ban_duration: '876000h',
    });

    await logAudit(session, {
        action: 'user.ban',
        targetType: 'user',
        targetId: userId,
        details: { duration: '100y' },
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath(`/control/users/${userId}`);
    return { ok: true as const };
}

/** Unban — clears banned_until. Owner-only. */
export async function unbanUserAction(userId: string) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb.auth.admin as any).updateUserById(userId, {
        ban_duration: 'none',
    });
    await logAudit(session, {
        action: 'user.unban',
        targetType: 'user',
        targetId: userId,
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath(`/control/users/${userId}`);
    return { ok: true as const };
}

/**
 * Nuclear: delete the auth user. CASCADEs through everything they own.
 *
 * Guarded by a server-side confirm-phrase check so a scripted invocation of
 * the server-action POST cannot bypass the client-side prompt() chain.
 */
export async function deleteUserAction(userId: string, confirmPhrase: string) {
    const session = await requireSession();
    if (confirmPhrase !== 'YES DELETE') {
        await logAudit(session, {
            action: 'user.delete',
            targetType: 'user',
            targetId: userId,
            ok: false,
            error: 'confirm phrase not provided',
        });
        return { ok: false as const, error: 'Confirm phrase mismatch' };
    }
    const sb = supabaseAdmin();
    const { error } = await sb.auth.admin.deleteUser(userId);
    await logAudit(session, {
        action: 'user.delete',
        targetType: 'user',
        targetId: userId,
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/users');
    return { ok: true as const };
}
