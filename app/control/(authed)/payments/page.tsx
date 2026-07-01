export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CreditCard, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { getPayments, getPaymentStats } from '../../queries-growth';

type SP = Promise<{ status?: string; provider?: string }>;

// Backend writes `status = 'success'` (not `'succeeded'`) — enum verified
// against production DB. If the enum drifts, prefer adding a new key here
// over renaming the backend; the fallback branch below shows raw status.
const STATUS_META: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    success: { label: 'Success', className: 'ch-pill--ok', Icon: CheckCircle2 },
    failed: { label: 'Failed', className: 'ch-pill--danger', Icon: XCircle },
    processing: { label: 'Processing', className: 'ch-pill--warn', Icon: Clock },
    refunded: { label: 'Refunded', className: 'ch-pill--muted', Icon: RotateCcw },
};

function money(minor: number | null, currency: string | null): string {
    if (minor == null) return '—';
    const cur = (currency ?? '').toUpperCase();
    const value = (minor / 100).toFixed(2);
    return `${value} ${cur}`;
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d`;
    return new Date(dateStr).toLocaleDateString();
}

export default async function PaymentsPage({ searchParams }: { searchParams: SP }) {
    const params = await searchParams;
    const status = params.status ?? 'all';
    const provider = params.provider ?? 'all';

    const [{ rows, total, error }, stats] = await Promise.all([
        getPayments({ status, provider, limit: 200 }),
        getPaymentStats(),
    ]);

    return (
        <div className="max-w-[1200px] space-y-5">
            {/* Header + stats */}
            <header>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Payments</h1>
                <p className="text-sm ch-soft mt-0.5">
                    {stats.total?.toLocaleString() ?? '—'} lifetime transactions
                </p>
            </header>

            {/* Stat pulse row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Succeeded today" value={stats.succeededToday} tone="ok" />
                <StatCard label="Failed today" value={stats.failedToday} tone={stats.failedToday && stats.failedToday > 0 ? 'danger' : 'muted'} />
                <StatCard label="Processing now" value={stats.processing} tone={stats.processing && stats.processing > 0 ? 'warn' : 'muted'} />
                <StatCard label="Refunded" value={stats.refunded} tone="muted" />
            </div>

            {/* Filters */}
            <form method="get" className="flex flex-wrap gap-2 items-center">
                <select name="status" defaultValue={status} className="ch-input max-w-xs">
                    <option value="all">All statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="processing">Processing</option>
                    <option value="refunded">Refunded</option>
                </select>
                <select name="provider" defaultValue={provider} className="ch-input max-w-xs">
                    <option value="all">All providers</option>
                    <option value="paystack">Paystack</option>
                    <option value="revenuecat_apple">Apple IAP</option>
                    <option value="revenuecat_google">Google IAP</option>
                </select>
                <button type="submit" className="ch-btn ch-btn--secondary">Filter</button>
                {(status !== 'all' || provider !== 'all') && (
                    <Link href="/control/payments" className="ch-btn ch-btn--ghost">Clear</Link>
                )}
            </form>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="ch-card">
                <div className="px-4 py-2.5 text-[11px] ch-muted flex items-center justify-between" style={{ background: 'var(--ch-cream)', borderBottom: '1px solid var(--ch-border)' }}>
                    <span>Showing {rows.length.toLocaleString()} of {total.toLocaleString()}</span>
                </div>
                {rows.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <CreditCard className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--ch-fg)' }}>No transactions match</p>
                        <p className="text-xs ch-muted mt-1">Try clearing filters or wait for the next payment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ch-fg-3)' }}>
                                    <th className="px-4 py-3">When</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-4 py-3">Provider</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((p) => {
                                    // Unknown status → render the raw string
                                    // (with a muted pill) so future enum drift
                                    // shows up loudly rather than misclassifying
                                    // real payments as 'Processing'.
                                    const meta = STATUS_META[p.status] ?? { label: p.status || 'unknown', className: 'ch-pill--muted', Icon: Clock };
                                    const Icon = meta.Icon;
                                    return (
                                        <tr key={p.id} style={{ borderTop: '1px solid var(--ch-border)' }}>
                                            <td className="px-4 py-3 whitespace-nowrap ch-muted">
                                                {timeAgo(p.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/control/users/${p.user_id}`} className="font-mono text-[11px] font-semibold" style={{ color: 'var(--ch-accent-dark)' }}>
                                                    {p.user_id?.slice(0, 8) ?? '—'}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--ch-fg)' }}>
                                                {money(p.amount, p.currency)}
                                            </td>
                                            <td className="px-4 py-3 capitalize ch-soft">{p.plan ?? '—'}</td>
                                            <td className="px-4 py-3 ch-soft">{p.provider ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`ch-pill ${meta.className}`}>
                                                    <Icon className="w-3 h-3" /> {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[11px] ch-muted truncate max-w-[180px]" title={p.provider_transaction_id ?? undefined}>
                                                {p.provider_transaction_id ?? '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-xs ch-muted">
                Stuck 'processing' rows older than 5 min are auto-DELETEd by the pg_cron reaper —
                see <Link href="/control/docs/backend/cron" className="underline" style={{ color: 'var(--ch-accent-dark)' }}>Cron jobs</Link>. Manual refunds go through the Paystack / RevenueCat dashboards.
            </p>
        </div>
    );
}

function StatCard({ label, value, tone }: { label: string; value: number | null; tone: 'ok' | 'warn' | 'danger' | 'muted' }) {
    const bg = tone === 'ok' ? 'var(--ch-success-tint)' : tone === 'warn' ? 'var(--ch-warn-tint)' : tone === 'danger' ? 'var(--ch-danger-tint)' : 'rgba(41, 26, 12, 0.03)';
    const fg = tone === 'ok' ? 'var(--ch-success)' : tone === 'warn' ? 'var(--ch-warn)' : tone === 'danger' ? 'var(--ch-danger)' : 'var(--ch-fg-2)';
    return (
        <div className="ch-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider ch-muted">{label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: fg, background: bg, display: 'inline-block', padding: '0.05rem 0.5rem', borderRadius: '6px' }}>
                {value == null ? '—' : value.toLocaleString()}
            </p>
        </div>
    );
}
