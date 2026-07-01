export const dynamic = 'force-dynamic';

import { UserPlus, Send, Check, Clock } from 'lucide-react';
import { getWaitlist, getWaitlistStats } from '../../queries-growth';
import { InviteButton } from './invite-button';

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
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

export default async function WaitlistPage() {
    const [{ rows, error }, stats] = await Promise.all([
        getWaitlist(500),
        getWaitlistStats(),
    ]);
    const conversionPct = stats.total && stats.total > 0 ? Math.round(((stats.invited ?? 0) / stats.total) * 100) : null;

    return (
        <div className="max-w-[1200px] space-y-5">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Waitlist</h1>
                    <p className="text-sm ch-soft mt-0.5">
                        {stats.total?.toLocaleString() ?? '—'} signups ·{' '}
                        {stats.invited?.toLocaleString() ?? '—'} invited{conversionPct != null ? ` (${conversionPct}%)` : ''} ·{' '}
                        <span className="font-semibold" style={{ color: 'var(--ch-accent-dark)' }}>{stats.uninvited.toLocaleString()} still waiting</span>
                    </p>
                </div>
                <InviteButton uninvitedCount={stats.uninvited} />
            </header>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            <div className="ch-card">
                {rows.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <UserPlus className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--ch-fg)' }}>Waitlist is empty</p>
                        <p className="text-xs ch-muted mt-1">Signups from the landing site land here.</p>
                    </div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--ch-border)' }}>
                        {rows.map((r) => (
                            <li key={r.id} className="px-5 py-3 flex items-center gap-4">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold" style={{ background: 'var(--ch-accent-tint)', color: 'var(--ch-accent-dark)' }}>
                                    {(r.name?.[0] ?? r.email[0]).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--ch-fg)' }}>{r.name || 'Anonymous'}</span>
                                        <a href={`mailto:${r.email}`} className="text-[12.5px]" style={{ color: 'var(--ch-accent-dark)' }}>{r.email}</a>
                                    </div>
                                    <p className="text-[11px] ch-muted mt-0.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> joined {timeAgo(r.created_at)}
                                    </p>
                                </div>
                                {r.invited_at ? (
                                    <span className="ch-pill ch-pill--ok">
                                        <Check className="w-3 h-3" /> invited {timeAgo(r.invited_at)}
                                    </span>
                                ) : (
                                    <span className="ch-pill ch-pill--gold">
                                        <Send className="w-3 h-3" /> pending
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="text-xs ch-muted">
                Invites fire real emails via Resend on your <span className="ch-kbd">mail.closetheritage.com</span> subdomain. Only owner-role admins can send.
            </p>
        </div>
    );
}
