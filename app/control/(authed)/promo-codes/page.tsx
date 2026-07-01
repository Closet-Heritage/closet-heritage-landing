export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Ticket, Plus, Copy, CheckCircle2, Circle, Users as UsersIcon, Coins } from 'lucide-react';
import { getPromoCodes, getPromoCodeStats } from '../../queries-growth';
import { CopyChip } from './copy-chip';

type SP = Promise<{ q?: string; type?: string }>;

const TYPE_LABEL: Record<string, { label: string; className: string }> = {
    all: { label: 'All types', className: '' },
    referral: { label: 'Referral', className: 'ch-pill--muted' },
    ambassador: { label: 'Ambassador', className: 'ch-pill--gold' },
    gift: { label: 'Gift', className: 'ch-pill--ok' },
    promo: { label: 'Promo', className: 'ch-pill--warn' },
};

function daysUntil(iso: string | null): string | null {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return 'expired';
    const d = Math.ceil(diff / 86400000);
    return d === 1 ? '1 day left' : `${d} days left`;
}

export default async function PromoCodesPage({ searchParams }: { searchParams: SP }) {
    const params = await searchParams;
    const search = params.q ?? '';
    const type = params.type ?? 'all';

    const [{ codes, error }, stats] = await Promise.all([
        getPromoCodes({ search, type }),
        getPromoCodeStats(),
    ]);

    return (
        <div className="max-w-[1200px] space-y-5">
            {/* Header */}
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Promo codes</h1>
                    <p className="text-sm ch-soft mt-0.5">
                        {stats.total?.toLocaleString() ?? '—'} total ·{' '}
                        {stats.active?.toLocaleString() ?? '—'} active ·{' '}
                        {stats.redemptions?.toLocaleString() ?? '—'} redemptions
                    </p>
                </div>
                <Link href="/control/promo-codes/new" className="ch-btn ch-btn--primary">
                    <Plus className="w-3.5 h-3.5" /> New code
                </Link>
            </header>

            {/* Filters */}
            <form method="get" className="flex flex-wrap gap-2 items-center">
                <input
                    name="q"
                    defaultValue={search}
                    placeholder="Search by code…"
                    className="ch-input max-w-xs"
                />
                <select name="type" defaultValue={type} className="ch-input max-w-xs">
                    {Object.entries(TYPE_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
                <button type="submit" className="ch-btn ch-btn--secondary">Filter</button>
                {(search || type !== 'all') && (
                    <Link href="/control/promo-codes" className="ch-btn ch-btn--ghost">Clear</Link>
                )}
            </form>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="ch-card">
                {codes.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Ticket className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--ch-fg)' }}>No codes yet</p>
                        <p className="text-xs ch-muted mt-1">Create one to start referrals, gifts, or ambassador programs.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ch-fg-3)', background: 'var(--ch-cream)' }}>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Owner</th>
                                    <th className="px-4 py-3">Rewards</th>
                                    <th className="px-4 py-3">Uses</th>
                                    <th className="px-4 py-3">Expires</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.map((c) => {
                                    const t = TYPE_LABEL[c.type] ?? TYPE_LABEL.promo;
                                    const daysLeft = daysUntil(c.expires_at);
                                    return (
                                        <tr key={c.id} style={{ borderTop: '1px solid var(--ch-border)' }}>
                                            <td className="px-4 py-3">
                                                <CopyChip value={c.code} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`ch-pill ${t.className}`}>{t.label}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {c.owner_id ? (
                                                    <Link href={`/control/users/${c.owner_id}`} className="font-medium" style={{ color: 'var(--ch-accent-dark)' }}>
                                                        {c.owner_name || c.owner_id.slice(0, 8)}
                                                    </Link>
                                                ) : (
                                                    <span className="ch-muted">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap ch-soft">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Coins className="w-3 h-3" style={{ color: 'var(--ch-accent)' }} />
                                                    {c.coins_redeemer} redeemer · {c.coins_referrer} referrer
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                <span className="font-semibold">{c.current_uses}</span>
                                                <span className="ch-muted"> / {c.max_uses ?? '∞'}</span>
                                                {c.total_redemptions > 0 && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] ch-muted">
                                                        <UsersIcon className="w-3 h-3" /> {c.total_redemptions}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs ch-muted">
                                                {daysLeft ?? 'never'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {c.is_active ? (
                                                    <span className="ch-pill ch-pill--ok">
                                                        <CheckCircle2 className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="ch-pill ch-pill--muted">
                                                        <Circle className="w-3 h-3" /> Off
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
