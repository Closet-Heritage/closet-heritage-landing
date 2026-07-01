export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft, Mail, Calendar, MapPin, Sparkles, Shirt, Palette, Wallet,
    CreditCard, User as UserIcon, CheckCircle2, XCircle, Copy,
} from 'lucide-react';
import { getUserById } from '../../../queries';
import { UserActions } from './actions';

type PP = Promise<{ id: string }>;

function fmt(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleString();
}
function relative(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default async function UserDetailPage({ params }: { params: PP }) {
    const { id } = await params;
    const data = await getUserById(id);
    if (!data) notFound();

    const { profile, email, emailConfirmedAt, lastSignInAt, provider, wardrobe, outfits, subscriptions, payments, tryonUsage } = data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = profile as any;
    const activeSub = subscriptions.find((s: { status: string }) => s.status === 'active' || s.status === 'trialing');
    const initials = (p.full_name ?? email ?? '?').split(/\s+/).map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="max-w-[1200px] space-y-5">
            <div className="flex items-center gap-2">
                <Link href="/control/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/50 hover:text-black/80 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Users
                </Link>
            </div>

            {/* Identity header */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#C4956A]/15 text-[#8B6B47] flex items-center justify-center text-xl font-semibold shrink-0">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-[#1A1A1A]">{p.full_name || 'Unnamed'}</h1>
                        {p.has_completed_onboarding && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-black/50 mt-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-black/30" />
                        {email ?? 'no email'}
                    </p>
                    <p className="text-xs text-black/40 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            joined {relative(p.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {p.gender ?? '—'}
                        </span>
                        {p.country && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {p.country}
                            </span>
                        )}
                        {provider && <span>via {provider}</span>}
                    </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-black/40">User ID</p>
                    <p className="text-xs font-mono text-black/60 flex items-center gap-1.5">
                        {id.slice(0, 8)}…
                        <Copy className="w-3 h-3 text-black/30" />
                    </p>
                </div>
            </div>

            {/* Actions strip — grant coins, ban, delete */}
            <UserActions userId={id} userName={(profile.full_name as string | null) ?? null} />

            {/* Key stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile icon={<Shirt className="w-4 h-4" />} tone="dark" label="Wardrobe items" value={wardrobe.total.toLocaleString()} />
                <StatTile icon={<Palette className="w-4 h-4" />} tone="dark" label="Saved outfits" value={outfits.total.toLocaleString()} />
                <StatTile
                    icon={<Wallet className="w-4 h-4" />}
                    tone={activeSub ? 'gold' : 'muted'}
                    label="Subscription"
                    value={activeSub ? `${activeSub.plan} · ${activeSub.status}` : 'none'}
                />
                <StatTile
                    icon={<Sparkles className="w-4 h-4" />}
                    tone={p.starter_persona_id ? 'gold' : 'muted'}
                    label="Starter persona"
                    value={p.starter_persona_id ? p.starter_persona_id.replace(/-/g, ' ') : 'not picked'}
                />
            </div>

            {/* Two columns: profile flags + wardrobe */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
                <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
                    <h2 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight mb-3">Profile flags</h2>
                    <dl className="space-y-2 text-xs">
                        <Row k="Onboarded" v={p.has_completed_onboarding ? 'yes' : 'no'} highlight={p.has_completed_onboarding} />
                        <Row k="AI consent" v={fmt(p.ai_consent_at)} highlight={!!p.ai_consent_at} />
                        <Row k="Trial announcement seen" v={fmt(p.trial_announcement_seen_at)} />
                        <Row k="Last active" v={fmt(p.last_active_at)} />
                        <Row k="Timezone" v={p.timezone ?? '—'} />
                        <Row k="Wash frequency" v={p.wash_frequency ?? '—'} />
                        <Row k="Re-engagement tier" v={String(p.re_engagement_tier ?? 0)} />
                        <Row k="Push token" v={p.expo_push_token ? 'yes' : 'no'} highlight={!!p.expo_push_token} />
                        <Row k="Daily recs" v={p.daily_recs_enabled ? `${p.daily_recs_hour}h` : 'off'} />
                        <Row k="Email confirmed" v={fmt(emailConfirmedAt)} highlight={!!emailConfirmedAt} />
                        <Row k="Last sign-in" v={fmt(lastSignInAt)} />
                    </dl>

                    <h3 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight mt-5 mb-3">Starter state</h3>
                    <dl className="space-y-2 text-xs">
                        <Row k="Persona" v={p.starter_persona_id ?? '—'} highlight={!!p.starter_persona_id} />
                        <Row k="Seeded at" v={fmt(p.starter_wardrobe_seeded_at)} />
                        <Row k="Avatar persona" v={p.starter_avatar_persona_id ?? '—'} highlight={!!p.starter_avatar_persona_id} />
                        <Row k="Banner dismissed" v={fmt(p.starter_banner_dismissed_at)} />
                    </dl>
                </section>

                <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight">Recent wardrobe</h2>
                        <span className="text-[11px] text-black/40 tabular-nums">{wardrobe.total} total</span>
                    </div>
                    {wardrobe.items.length === 0 ? (
                        <p className="text-xs text-black/40 py-8 text-center">No items yet</p>
                    ) : (
                        <div className="grid grid-cols-4 gap-1.5">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {wardrobe.items.slice(0, 12).map((it: any) => (
                                <div key={it.id} className="aspect-square rounded-lg bg-[#F5F5F7] overflow-hidden relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={it.cropped_image_url} alt={it.name} className="w-full h-full object-contain" />
                                    {it.source === 'starter' && (
                                        <span className="absolute bottom-1 left-1 text-[8px] font-semibold px-1 py-0.5 rounded-full bg-[#C4956A]/90 text-white flex items-center gap-0.5">
                                            <Sparkles className="w-2 h-2" />
                                            Starter
                                        </span>
                                    )}
                                    {it.archived && (
                                        <span className="absolute top-1 right-1 text-[8px] font-semibold px-1 py-0.5 rounded-full bg-black/60 text-white">
                                            Archived
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight mt-5 mb-3">Recent outfits</h3>
                    {outfits.items.length === 0 ? (
                        <p className="text-xs text-black/40 py-4">None yet</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {outfits.items.slice(0, 6).map((o: any) => (
                                <li key={o.id} className="flex items-center justify-between text-xs">
                                    <span className="text-[#1A1A1A] font-medium truncate">{o.name || 'Untitled outfit'}</span>
                                    <span className="text-black/40 shrink-0 flex items-center gap-2">
                                        {o.tryon_image_url && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">tryon</span>}
                                        {relative(o.created_at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {/* Subs + payments */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
                <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
                    <h2 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight mb-3">Subscriptions</h2>
                    {subscriptions.length === 0 ? (
                        <p className="text-xs text-black/40 py-4">No subscriptions</p>
                    ) : (
                        <div className="space-y-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {subscriptions.map((s: any) => (
                                <div key={s.id} className="rounded-lg border border-black/[0.06] p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-[#1A1A1A]">{s.plan}</p>
                                        <StatusPill status={s.status} />
                                    </div>
                                    <p className="text-[11px] text-black/45">
                                        {s.provider} · from {fmt(s.current_period_start)} → {fmt(s.current_period_end)}
                                        {s.cancel_at_period_end && ' · will cancel'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight mt-5 mb-3">Try-on usage (last 3 months)</h3>
                    {tryonUsage.length === 0 ? (
                        <p className="text-xs text-black/40 py-4">None</p>
                    ) : (
                        <div className="space-y-1.5">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {tryonUsage.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between text-xs">
                                    <span className="text-black/60">{new Date(t.month_start).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                                    <span className="font-semibold text-[#1A1A1A] tabular-nums">{t.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
                    <h2 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight mb-3">Recent payments</h2>
                    {payments.length === 0 ? (
                        <p className="text-xs text-black/40 py-4">No payments</p>
                    ) : (
                        <div className="space-y-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {payments.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between rounded-lg border border-black/[0.06] p-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                                            <CreditCard className="w-3 h-3 text-black/40" />
                                            {p.amount != null ? `${(p.amount / 100).toFixed(2)} ${p.currency ?? ''}` : '—'}
                                        </p>
                                        <p className="text-[11px] text-black/45">{p.provider} · {p.plan ?? '—'} · {fmt(p.created_at)}</p>
                                    </div>
                                    <StatusPill status={p.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function StatTile({
    icon, tone, label, value,
}: {
    icon: React.ReactNode;
    tone: 'dark' | 'gold' | 'muted';
    label: string;
    value: string;
}) {
    const tones: Record<typeof tone, string> = {
        dark: 'bg-[#1A1A1A]/[0.05] text-[#1A1A1A]',
        gold: 'bg-[#C4956A]/15 text-[#8B6B47]',
        muted: 'bg-black/[0.03] text-black/40',
    } as const;
    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones[tone]}`}>{icon}</span>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-black/40">{label}</p>
            </div>
            <p className="text-lg font-bold text-[#1A1A1A] capitalize">{value}</p>
        </div>
    );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-black/45">{k}</dt>
            <dd className={`font-medium tabular-nums ${highlight ? 'text-emerald-600' : 'text-black/70'}`}>{v}</dd>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const s = (status ?? '').toLowerCase();
    const tone = s === 'active' || s === 'succeeded' || s === 'trialing'
        ? 'bg-emerald-500/10 text-emerald-700'
        : s === 'failed' || s === 'cancelled' || s === 'canceled' || s === 'expired'
            ? 'bg-[#CE1126]/10 text-[#CE1126]'
            : 'bg-black/[0.05] text-black/50';
    const Icon = s === 'failed' || s === 'cancelled' || s === 'canceled' || s === 'expired' ? XCircle : CheckCircle2;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${tone}`}>
            <Icon className="w-2.5 h-2.5" />
            {status}
        </span>
    );
}
