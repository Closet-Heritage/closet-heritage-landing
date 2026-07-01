export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { AlertTriangle, UserPlus, Sparkles, CreditCard, Wallet, Shirt, Users as UsersIcon, MessageSquare, Flag, ServerCrash } from 'lucide-react';
import { getDashboardStats, getRecentSignups, getRecentSubscriptions, getRecentPayments, type Counted } from '../queries';

function timeAgo(dateStr: string | null | undefined): string {
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

function countText(c: Counted): string {
    return c.count == null ? '—' : c.count.toLocaleString();
}
function countNum(c: Counted): number {
    return c.count ?? 0;
}

type FeedType = 'signup' | 'sub' | 'pay';
function FeedIcon({ type }: { type: FeedType }) {
    const map = {
        signup: { I: UserPlus, c: 'bg-emerald-500/10 text-emerald-600' },
        sub: { I: Sparkles, c: 'bg-[#C4956A]/12 text-[#8B6B47]' },
        pay: { I: CreditCard, c: 'bg-blue-500/10 text-blue-600' },
    }[type];
    const I = map.I;
    return <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${map.c}`}><I className="w-3.5 h-3.5" /></span>;
}

export default async function ControlDashboard() {
    const [statsRes, signups, subs, payments] = await Promise.all([
        getDashboardStats(),
        getRecentSignups(20),
        getRecentSubscriptions(15),
        getRecentPayments(15),
    ]);

    const { stats, errors: statErrors } = statsRes;
    const feedErrors = [signups.error, subs.error, payments.error].filter((s): s is string => !!s);
    const allErrors = [...statErrors, ...feedErrors];

    const hour = new Date().getUTCHours();
    const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    // ── Needs you ──
    // NULL counts (query failed) surface as "unknown" tiles, NOT hidden. A
    // dashboard whose whole point is visibility must not silently answer
    // "all clear" when it can't actually tell.
    type Need = { key: string; icon: typeof AlertTriangle; tone: 'red' | 'amber'; title: string; sub: string; cta: string; href: string };
    const needs: Need[] = [];
    if (stats.contactMessages.count === null) {
        needs.push({
            key: 'contact-unknown', icon: AlertTriangle, tone: 'amber',
            title: 'Contact messages: query failed',
            sub: 'See red banner for details',
            cta: 'Open', href: '/control/contact-messages',
        });
    } else if (stats.contactMessages.count > 0) {
        needs.push({
            key: 'contact', icon: MessageSquare, tone: 'amber',
            title: `${stats.contactMessages.count} contact message${stats.contactMessages.count > 1 ? 's' : ''}`,
            sub: 'Users have written in',
            cta: 'Open', href: '/control/contact-messages',
        });
    }
    if (stats.commentReports.count === null) {
        needs.push({
            key: 'reports-unknown', icon: AlertTriangle, tone: 'amber',
            title: 'Reported comments: query failed',
            sub: 'See red banner for details',
            cta: 'Review', href: '/control/reports',
        });
    } else if (stats.commentReports.count > 0) {
        needs.push({
            key: 'reports', icon: Flag, tone: 'red',
            title: `${stats.commentReports.count} reported comment${stats.commentReports.count > 1 ? 's' : ''}`,
            sub: 'Content flagged by users',
            cta: 'Review', href: '/control/reports',
        });
    }

    // ── Live feed ──
    type FeedItem = { id: string; type: FeedType; when: number; whenStr: string; who: string; detail: React.ReactNode };
    const feed: FeedItem[] = [];
    for (const u of signups.data) {
        feed.push({
            id: 's' + u.id, type: 'signup', when: new Date(u.created_at).getTime(), whenStr: u.created_at,
            who: u.full_name || 'New user',
            detail: <>joined{u.starter_persona_id ? <> · picked <span className="font-medium text-[#8B6B47]">{u.starter_persona_id.replace(/-/g, ' ')}</span></> : ''}{u.country ? ` · ${u.country}` : ''}</>,
        });
    }
    for (const s of subs.data) {
        const when = s.updated_at || s.created_at;
        feed.push({
            id: 'u' + s.id, type: 'sub', when: new Date(when).getTime(), whenStr: when,
            who: s.user_id.slice(0, 8),
            detail: <>{s.status} · {s.plan}{s.provider ? ` · ${s.provider}` : ''}</>,
        });
    }
    for (const p of payments.data) {
        const status = p.status;
        const amountStr = p.amount != null ? `${(p.amount / 100).toFixed(2)} ${p.currency ?? ''}` : '';
        feed.push({
            id: 'p' + p.id, type: 'pay', when: new Date(p.created_at).getTime(), whenStr: p.created_at,
            who: p.user_id.slice(0, 8),
            detail: <><span className={status === 'success' ? 'font-medium' : status === 'failed' ? 'font-medium' : ''} style={{ color: status === 'success' ? 'var(--ch-success)' : status === 'failed' ? 'var(--ch-danger)' : undefined }}>{status}</span> {amountStr} · {p.provider}</>,
        });
    }
    feed.sort((a, b) => b.when - a.when);
    const liveFeed = feed.slice(0, 30);

    return (
        <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full">
            <div className="px-4 sm:px-6 pt-6">
                <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--ch-fg)' }}>Good {greeting}</h1>
                <p className="text-[13px] ch-muted mt-0.5">
                    {countText(stats.dauToday)} active today · {countText(stats.signupsToday)} new signups · {countText(stats.totalUsers)} users all-time
                </p>
            </div>

            {/* Query-failure banner — do NOT hide a broken panel behind fake zeros. */}
            {allErrors.length > 0 && (
                <div
                    className="mx-4 sm:mx-6 mt-4 rounded-2xl p-4 flex items-start gap-3"
                    style={{ background: 'var(--ch-danger-tint)', border: '1px solid var(--ch-danger)' }}
                >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                        <ServerCrash className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold" style={{ color: 'var(--ch-danger)' }}>{allErrors.length} query error{allErrors.length > 1 ? 's' : ''}</p>
                        <p className="text-xs ch-soft mt-0.5">Tiles below showing <span className="font-mono">—</span> reflect failed queries, not zero rows.</p>
                        <details className="mt-2">
                            <summary className="text-xs ch-muted cursor-pointer">Show details</summary>
                            <ul className="mt-1.5 space-y-0.5 text-[11px] font-mono ch-muted">
                                {allErrors.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </details>
                    </div>
                </div>
            )}

            <div className="px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-[1fr_minmax(330px,390px)] gap-5 items-start">
                {/* LEFT — needs + pulse */}
                <div className="space-y-5">
                    <section className="ch-card overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--ch-border)' }}>
                            <h2 className="text-[13px] font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Needs you</h2>
                            {needs.length > 0 && (
                                <span className="ch-pill ch-pill--danger">{needs.length}</span>
                            )}
                        </div>
                        {needs.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--ch-success-tint)', color: 'var(--ch-success)' }}>
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <p className="text-[14px] font-medium" style={{ color: 'var(--ch-fg)' }}>All clear</p>
                                <p className="text-[12.5px] ch-muted mt-0.5">Nothing needs you right now.</p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: 'var(--ch-border)' }}>
                                {needs.map(n => {
                                    const Icon = n.icon;
                                    const iconStyle = n.tone === 'red'
                                        ? { background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }
                                        : { background: 'var(--ch-warn-tint)', color: 'var(--ch-warn)' };
                                    return (
                                        <div key={n.key} className="flex items-center gap-3.5 px-5 py-4">
                                            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={iconStyle}>
                                                <Icon className="w-[18px] h-[18px]" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[14px] font-semibold" style={{ color: 'var(--ch-fg)' }}>{n.title}</p>
                                                <p className="text-[12.5px] ch-muted">{n.sub}</p>
                                            </div>
                                            <Link
                                                href={n.href}
                                                className={n.tone === 'red' ? 'ch-btn ch-btn--danger' : 'ch-btn ch-btn--primary'}
                                            >
                                                {n.cta}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="ch-card p-5">
                        <h2 className="text-[13px] font-bold tracking-tight mb-4" style={{ color: 'var(--ch-fg)' }}>Pulse</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-wide ch-muted">Active today</p>
                                <p className="text-2xl font-semibold tabular-nums mt-0.5" style={{ color: 'var(--ch-fg)' }}>{countText(stats.dauToday)}</p>
                                {stats.dauToday.count != null && stats.dauYesterday.count != null && stats.dauToday.count !== stats.dauYesterday.count && (
                                    <p className="text-[11px] font-medium" style={{ color: stats.dauToday.count > stats.dauYesterday.count ? 'var(--ch-success)' : 'var(--ch-danger)' }}>
                                        {stats.dauToday.count > stats.dauYesterday.count ? '+' : ''}{stats.dauToday.count - stats.dauYesterday.count} vs yesterday
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wide ch-muted">New today</p>
                                <p className="text-2xl font-semibold tabular-nums mt-0.5" style={{ color: 'var(--ch-fg)' }}>{countText(stats.signupsToday)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wide ch-muted">This week</p>
                                <p className="text-2xl font-semibold tabular-nums mt-0.5" style={{ color: 'var(--ch-fg)' }}>{countText(stats.signupsThisWeek)}</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid var(--ch-border)' }}>
                            <TileLink href="/control/users" icon={<UsersIcon className="w-3.5 h-3.5" />} k="Users" v={countText(stats.totalUsers)} />
                            <TileLink href="#" icon={<Shirt className="w-3.5 h-3.5" />} k="Items" v={countText(stats.totalItems)} />
                            <TileLink href="#" icon={<Sparkles className="w-3.5 h-3.5" />} k="Outfits" v={countText(stats.totalOutfits)} />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3">
                            <TileLink href="#" icon={<Wallet className="w-3.5 h-3.5" />} k="Active subs" v={countText(stats.activeSubs)} />
                            <TileLink href="#" icon={<Sparkles className="w-3.5 h-3.5" />} k="Trials" v={countText(stats.trialSubs)} />
                            <TileLink href="#" icon={<Sparkles className="w-3.5 h-3.5" />} k="Starter picks" v={countText(stats.starterSeeded)} />
                        </div>
                    </section>
                </div>

                {/* RIGHT — live feed */}
                <section className="ch-card overflow-hidden lg:sticky lg:top-4">
                    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--ch-border)' }}>
                        <h2 className="text-[13px] font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--ch-fg)' }}>
                            <span className="relative flex w-2 h-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: 'rgba(15, 109, 61, 0.5)' }} />
                                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--ch-success)' }} />
                            </span>
                            Live
                        </h2>
                        <span className="text-[11px] ch-muted">latest activity</span>
                    </div>
                    <div className="divide-y max-h-[72vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ borderColor: 'var(--ch-border)' }}>
                        {liveFeed.length === 0 && <p className="px-5 py-12 text-center text-[13px] ch-muted">No activity yet</p>}
                        {liveFeed.map(item => (
                            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--ch-accent-tint)] transition-colors">
                                <FeedIcon type={item.type} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--ch-fg)' }}>{item.who}</p>
                                    <p className="text-[12px] ch-muted truncate">{item.detail}</p>
                                </div>
                                {item.whenStr && <span className="text-[11px] ch-muted shrink-0 tabular-nums">{timeAgo(item.whenStr)}</span>}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function TileLink({ href, icon, k, v }: { href: string; icon: React.ReactNode; k: string; v: string }) {
    return (
        <Link href={href} className="group">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="ch-muted group-hover:text-[color:var(--ch-accent-dark)] transition-colors">{icon}</span>
                <p className="text-[11px] uppercase tracking-wide ch-muted">{k}</p>
            </div>
            <p className="text-[15px] font-semibold tabular-nums group-hover:text-[color:var(--ch-accent-dark)] transition-colors" style={{ color: 'var(--ch-fg)' }}>{v}</p>
        </Link>
    );
}
