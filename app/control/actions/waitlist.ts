'use server';

import { revalidatePath } from 'next/cache';
import { logAudit, requireSession } from '../audit';

/**
 * Batch-invite users from the waitlist. Owner-only — this fires real email
 * via Resend and cannot be undone.
 *
 * Wraps `POST /api/v1/waitlist/send-invites` in the backend. Auth is a
 * body-secret (SUPABASE_SERVICE_ROLE_KEY) — same key pg_cron uses.
 */
export async function sendInvitesAction(input: {
    emails: string[];       // optional; empty means "send to all uninvited"
    testFlightUrl: string;
    playStoreUrl: string;
}) {
    const session = await requireSession();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!backendUrl) {
        await logAudit(session, {
            action: 'waitlist.send_invites',
            details: { targetedCount: input.emails.length, envMissing: 'NEXT_PUBLIC_BACKEND_URL' },
            ok: false,
            error: 'NEXT_PUBLIC_BACKEND_URL not set',
        });
        return { ok: false as const, error: 'NEXT_PUBLIC_BACKEND_URL not set' };
    }
    if (!serviceKey) {
        await logAudit(session, {
            action: 'waitlist.send_invites',
            details: { targetedCount: input.emails.length, envMissing: 'SUPABASE_SERVICE_ROLE_KEY' },
            ok: false,
            error: 'SUPABASE_SERVICE_ROLE_KEY not set',
        });
        return { ok: false as const, error: 'SUPABASE_SERVICE_ROLE_KEY not set' };
    }

    // Strip trailing /api/v1 if present, then append the real route
    // (POST /api/v1/waitlist/send-invites — verified against waitlist.routes.ts).
    const base = backendUrl.replace(/\/api\/v1\/?$/, '');
    const url = `${base}/api/v1/waitlist/send-invites`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adminSecret: serviceKey,
                emails: input.emails,
                testFlightUrl: input.testFlightUrl,
                playStoreUrl: input.playStoreUrl,
            }),
            cache: 'no-store',
            signal: AbortSignal.timeout(60000),
        });
        const json = await res.json().catch(() => ({}));
        const ok = res.ok && json?.success !== false;

        await logAudit(session, {
            action: 'waitlist.send_invites',
            details: {
                targetedCount: input.emails.length,
                testFlightUrl: input.testFlightUrl,
                playStoreUrl: input.playStoreUrl,
                response: json,
            },
            ok,
            error: ok ? undefined : (json?.error?.message ?? json?.message ?? `HTTP ${res.status}`),
        });

        if (!ok) return { ok: false as const, error: json?.error?.message ?? json?.message ?? `Backend responded ${res.status}` };

        revalidatePath('/control/waitlist');
        // Bubble up whatever the backend returns (sent count etc.) so the UI
        // can flash a specific "sent N invites" instead of a generic message.
        return { ok: true as const, response: json };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await logAudit(session, { action: 'waitlist.send_invites', ok: false, error: msg });
        return { ok: false as const, error: msg };
    }
}
