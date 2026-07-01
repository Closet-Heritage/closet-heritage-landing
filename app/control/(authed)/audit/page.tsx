export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ScrollText, CheckCircle2, XCircle, User as UserIcon } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function getAudit(limit = 200) {
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('admin_audit_log')
        .select('id, admin_name, admin_role, action, target_type, target_id, details, ip, ok, error, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) return { rows: [], error: error.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { rows: (data ?? []) as any[], error: null };
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function targetHref(row: { target_type: string | null; target_id: string | null }): string | null {
    if (!row.target_type || !row.target_id) return null;
    if (row.target_type === 'user') return `/control/users/${row.target_id}`;
    if (row.target_type === 'promo_code') return `/control/promo-codes`;
    return null;
}

export default async function AuditPage() {
    const { rows, error } = await getAudit(300);

    return (
        <div className="max-w-[1100px] space-y-5">
            <header>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Audit log</h1>
                <p className="text-sm ch-soft mt-0.5">
                    Every action taken through the control panel. Immutable, service-role-only.
                </p>
            </header>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            <div className="ch-card">
                {rows.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <ScrollText className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--ch-fg)' }}>No actions logged yet</p>
                        <p className="text-xs ch-muted mt-1">Ban a user, grant coins, create a code — anything you do here lands here.</p>
                    </div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--ch-border)' }}>
                        {rows.map((r) => {
                            const href = targetHref(r);
                            return (
                                <li key={r.id} className="px-5 py-3">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                                            style={{ background: r.admin_role === 'owner' ? 'var(--ch-accent-tint)' : 'rgba(41,26,12,0.06)', color: r.admin_role === 'owner' ? 'var(--ch-accent-dark)' : 'var(--ch-fg-2)' }}
                                            title={`${r.admin_name} · ${r.admin_role}`}
                                        >
                                            {(r.admin_name?.[0] ?? '?').toUpperCase()}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-[13.5px] font-semibold" style={{ color: 'var(--ch-fg)' }}>{r.admin_name}</span>
                                                <span className="ch-kbd">{r.action}</span>
                                                {r.target_id && (
                                                    href ? (
                                                        <Link href={href} className="text-[11px] font-mono" style={{ color: 'var(--ch-accent-dark)' }}>
                                                            {r.target_type}:{r.target_id.slice(0, 8)}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[11px] font-mono ch-muted">
                                                            {r.target_type}:{r.target_id.slice(0, 8)}
                                                        </span>
                                                    )
                                                )}
                                                {r.ok ? (
                                                    <span className="ch-pill ch-pill--ok">
                                                        <CheckCircle2 className="w-3 h-3" /> ok
                                                    </span>
                                                ) : (
                                                    <span className="ch-pill ch-pill--danger">
                                                        <XCircle className="w-3 h-3" /> failed
                                                    </span>
                                                )}
                                            </div>
                                            {r.error && (
                                                <p className="text-[11.5px] mt-1 font-mono" style={{ color: 'var(--ch-danger)' }}>{r.error}</p>
                                            )}
                                            {r.details && Object.keys(r.details).length > 0 && (
                                                <details className="mt-1">
                                                    <summary className="text-[11px] ch-muted cursor-pointer">Details</summary>
                                                    <pre className="mt-1 text-[10.5px] font-mono ch-soft overflow-x-auto p-2 rounded-md" style={{ background: 'var(--ch-cream)' }}>
                                                        {JSON.stringify(r.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                        <div className="text-[11px] ch-muted shrink-0">
                                            {timeAgo(r.created_at)}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
