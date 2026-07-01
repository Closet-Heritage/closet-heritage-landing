export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Cpu, CheckCircle2, XCircle, Clock, ImageIcon, Sparkles, DollarSign } from 'lucide-react';
import { getBatches, getAIStats } from '../../queries-ai';

type SP = Promise<{ status?: string }>;

const STATUS_META: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    completed: { label: 'Completed', className: 'ch-pill--ok', Icon: CheckCircle2 },
    failed: { label: 'Failed', className: 'ch-pill--danger', Icon: XCircle },
    processing: { label: 'Processing', className: 'ch-pill--warn', Icon: Clock },
    pending: { label: 'Pending', className: 'ch-pill--muted', Icon: Clock },
};

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '—';
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

function ms(v: number | null): string {
    if (v == null) return '—';
    if (v < 1000) return `${v}ms`;
    return `${(v / 1000).toFixed(1)}s`;
}

export default async function AIOpsPage({ searchParams }: { searchParams: SP }) {
    const params = await searchParams;
    const status = params.status ?? 'all';

    const [{ rows, total, error }, stats] = await Promise.all([
        getBatches({ status, limit: 100 }),
        getAIStats(),
    ]);

    return (
        <div className="max-w-[1200px] space-y-5">
            <header>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>AI operations</h1>
                <p className="text-sm ch-soft mt-0.5">
                    Every wardrobe upload + try-on. Cost estimates are rough — Google Cloud billing is the source of truth.
                </p>
            </header>

            {/* Stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Failed today" value={stats.failedToday} tone={stats.failedToday && stats.failedToday > 0 ? 'danger' : 'ok'} />
                <StatCard label="Processing now" value={stats.processing} tone={stats.processing && stats.processing > 0 ? 'warn' : 'muted'} />
                <StatCard
                    label="Photos this month"
                    value={stats.photosThisMonth}
                    tone="muted"
                    icon={<ImageIcon className="w-3 h-3" />}
                />
                <StatCard
                    label="Try-ons this month"
                    value={stats.tryonThisMonth}
                    tone="gold"
                    icon={<Sparkles className="w-3 h-3" />}
                />
            </div>

            {/* Cost callout */}
            <div className="ch-card p-4 flex items-center gap-4">
                <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--ch-accent-tint)', color: 'var(--ch-accent-dark)' }}
                >
                    <DollarSign className="w-5 h-5" />
                </span>
                <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider ch-muted">Rough Gemini spend this month</p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--ch-fg)' }}>
                        ${stats.estCostThisMonthUsd.toFixed(2)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[11px] ch-muted">Assumptions</p>
                    <p className="text-[12px] ch-soft">${stats.estCostPhotoUsd.toFixed(2)}/photo · ${stats.estCostTryonUsd.toFixed(2)}/tryon</p>
                </div>
            </div>

            {/* Filters */}
            <form method="get" className="flex flex-wrap gap-2 items-center">
                <select name="status" defaultValue={status} className="ch-input max-w-xs">
                    <option value="all">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                </select>
                <button type="submit" className="ch-btn ch-btn--secondary">Filter</button>
                {status !== 'all' && (
                    <Link href="/control/ai-ops" className="ch-btn ch-btn--ghost">Clear</Link>
                )}
            </form>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            {/* Batches table */}
            <div className="ch-card">
                <div className="px-4 py-2.5 text-[11px] ch-muted flex items-center justify-between" style={{ background: 'var(--ch-cream)', borderBottom: '1px solid var(--ch-border)' }}>
                    <span>Showing {rows.length.toLocaleString()} of {total.toLocaleString()} batches</span>
                </div>
                {rows.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Cpu className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--ch-fg)' }}>No batches</p>
                        <p className="text-xs ch-muted mt-1">Wardrobe uploads land here as they run.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ch-fg-3)' }}>
                                    <th className="px-4 py-3">When</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Photos</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((b) => {
                                    const meta = STATUS_META[b.status] ?? STATUS_META.pending;
                                    const Icon = meta.Icon;
                                    return (
                                        <tr key={b.id} style={{ borderTop: '1px solid var(--ch-border)' }}>
                                            <td className="px-4 py-3 whitespace-nowrap ch-muted">{timeAgo(b.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <Link href={`/control/users/${b.user_id}`} className="font-mono text-[11px] font-semibold" style={{ color: 'var(--ch-accent-dark)' }}>
                                                    {b.user_id?.slice(0, 8) ?? '—'}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                <span className="font-semibold" style={{ color: 'var(--ch-fg)' }}>{b.photos_processed ?? 0}</span>
                                                <span className="ch-muted"> / {b.total_photos ?? 0}</span>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--ch-fg)' }}>
                                                {b.items_detected ?? 0}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`ch-pill ${meta.className}`}>
                                                    <Icon className="w-3 h-3" /> {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums ch-muted">{ms(b.processing_time_ms)}</td>
                                            <td className="px-4 py-3 text-[11.5px] font-mono max-w-[260px] truncate" style={{ color: 'var(--ch-danger)' }} title={b.error_message ?? undefined}>
                                                {b.error_message ?? ''}
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

function StatCard({ label, value, tone, icon }: { label: string; value: number | null; tone: 'ok' | 'warn' | 'danger' | 'muted' | 'gold'; icon?: React.ReactNode }) {
    const bg =
        tone === 'ok' ? 'var(--ch-success-tint)' :
        tone === 'warn' ? 'var(--ch-warn-tint)' :
        tone === 'danger' ? 'var(--ch-danger-tint)' :
        tone === 'gold' ? 'var(--ch-accent-tint)' :
        'rgba(41, 26, 12, 0.03)';
    const fg =
        tone === 'ok' ? 'var(--ch-success)' :
        tone === 'warn' ? 'var(--ch-warn)' :
        tone === 'danger' ? 'var(--ch-danger)' :
        tone === 'gold' ? 'var(--ch-accent-dark)' :
        'var(--ch-fg-2)';
    return (
        <div className="ch-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider ch-muted flex items-center gap-1">
                {icon}{label}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: fg, background: bg, display: 'inline-block', padding: '0.05rem 0.5rem', borderRadius: '6px' }}>
                {value == null ? '—' : value.toLocaleString()}
            </p>
        </div>
    );
}
