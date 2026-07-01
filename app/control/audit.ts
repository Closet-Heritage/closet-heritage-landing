/**
 * Audit logging + session-required guard for control panel server actions.
 *
 * Every mutation through the panel MUST go through `logAudit()` so we have
 * a durable record of who did what. The `requireSession()` helper is
 * belt-and-suspenders — middleware already gates /control/*, but a defensive
 * server-side check keeps a broken middleware config from producing an
 * unauthenticated write.
 */
import 'server-only';
import { headers } from 'next/headers';
import { getSession } from './auth';
import type { ControlSession } from '@/lib/control-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function requireSession(): Promise<ControlSession> {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized — no control session');
    return session;
}

// NOTE: An earlier design had `requireOwner()` for high-risk actions. Removed
// in R-Ctrl8 — a 2-person team where both admins run the business is served
// better by trusting both roles equally + relying on the audit log to trace
// who did what. If we ever need per-action gating again, re-add here.

async function clientIp(): Promise<string | null> {
    try {
        const h = await headers();
        return h.get('x-forwarded-for')?.split(',')[0]?.trim()
            ?? h.get('x-real-ip')
            ?? null;
    } catch {
        return null;
    }
}

export type AuditEntry = {
    action: string;
    targetType?: string;
    targetId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: Record<string, any>;
    ok?: boolean;
    error?: string;
};

/**
 * Insert an audit row. Never throws — a failing audit write must not break
 * the actual action (that would give operators a reason to bypass the log).
 * Errors here are logged to server console and swallowed.
 */
export async function logAudit(session: ControlSession, entry: AuditEntry): Promise<void> {
    try {
        const sb = supabaseAdmin();
        const ip = await clientIp();
        const { error } = await sb.from('admin_audit_log').insert({
            admin_name: session.name,
            admin_role: session.role,
            action: entry.action,
            target_type: entry.targetType ?? null,
            target_id: entry.targetId ?? null,
            details: entry.details ?? null,
            ip,
            ok: entry.ok ?? true,
            error: entry.error ?? null,
        });
        if (error) console.error('[audit] insert failed:', error.message);
    } catch (err) {
        console.error('[audit] logAudit threw:', err);
    }
}
