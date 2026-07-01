export const dynamic = 'force-dynamic';

import {
    ServerCog, Database, Sparkles, CheckCircle2, XCircle, AlertTriangle,
    ShieldCheck, Gauge, CloudCog, Layers, Wifi, WifiOff,
} from 'lucide-react';
import { getSystemHealth } from '../../queries';

export default async function SystemHealthPage() {
    const h = await getSystemHealth();

    const critical: string[] = [];
    if (!h.env.SUPABASE_URL) critical.push('SUPABASE_URL');
    if (!h.env.SUPABASE_SERVICE_ROLE_KEY) critical.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!h.env.CONTROL_PASSWORD) critical.push('CONTROL_PASSWORD');
    if (!h.env.CONTROL_SIGNING_KEY) critical.push('CONTROL_SIGNING_KEY');

    const backendUnreachable = h.backend.configured && h.backend.reachable === false;
    const backendUnconfigured = !h.backend.configured;
    const supabaseFailing = !h.supabase.reachable;
    const anyCritical = critical.length > 0 || backendUnreachable || supabaseFailing;

    return (
        <div className="max-w-[1200px] space-y-5">
            <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#1A1A1A]/[0.06] flex items-center justify-center">
                    <ServerCog className="w-4 h-4 text-[#1A1A1A]" />
                </span>
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">System health</h1>
                    <p className="text-sm text-black/50 mt-0.5">Environment, backend, and Supabase status</p>
                </div>
            </div>

            {/* Status banner — three states: OK, unconfigured (amber), critical (red) */}
            <div
                className={`rounded-2xl border p-4 flex items-center gap-3 ${
                    anyCritical
                        ? 'bg-[#CE1126]/[0.04] border-[#CE1126]/20'
                        : backendUnconfigured
                            ? 'bg-amber-500/[0.04] border-amber-500/25'
                            : 'bg-emerald-500/[0.04] border-emerald-500/15'
                }`}
            >
                <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        anyCritical ? 'bg-[#CE1126]/10 text-[#CE1126]' : backendUnconfigured ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}
                >
                    {anyCritical || backendUnconfigured ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </span>
                <div className="min-w-0">
                    <p
                        className={`text-sm font-bold ${
                            anyCritical ? 'text-[#CE1126]' : backendUnconfigured ? 'text-amber-800' : 'text-emerald-700'
                        }`}
                    >
                        {critical.length > 0
                            ? `${critical.length} critical env var${critical.length > 1 ? 's' : ''} missing`
                            : supabaseFailing
                                ? `${h.supabase.errors.length} Supabase query error${h.supabase.errors.length > 1 ? 's' : ''}`
                                : backendUnreachable
                                    ? 'Backend unreachable'
                                    : backendUnconfigured
                                        ? 'Backend URL not set'
                                        : 'All systems healthy'}
                    </p>
                    <p className="text-xs text-black/50 mt-0.5 tabular-nums">
                        Supabase {h.supabase.latencyMs}ms · Backend {h.backend.reachable ? `${h.backend.latencyMs}ms` : h.backend.configured ? 'unreachable' : 'not configured'}
                    </p>
                </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Tile
                    icon={<Wifi className="w-4 h-4" />}
                    tone={h.backend.reachable ? 'green' : h.backend.configured ? 'red' : 'muted'}
                    label="Backend"
                    value={h.backend.reachable ? `${h.backend.latencyMs}ms` : h.backend.configured ? 'unreachable' : 'not set'}
                    sub={h.backend.url ?? 'NEXT_PUBLIC_BACKEND_URL missing'}
                />
                <Tile
                    icon={<Database className="w-4 h-4" />}
                    tone={h.supabase.reachable ? 'green' : 'red'}
                    label="Supabase"
                    value={`${h.supabase.latencyMs}ms`}
                    sub={h.supabase.totalUsers == null ? 'query failed' : `${h.supabase.totalUsers.toLocaleString()} users`}
                />
                <Tile
                    icon={<Sparkles className="w-4 h-4" />}
                    tone={h.supabase.activeStarterSkus != null && h.supabase.activeStarterSkus > 0 ? 'gold' : 'muted'}
                    label="Starter SKUs"
                    value={h.supabase.activeStarterSkus == null || h.supabase.totalStarterSkus == null ? '—' : `${h.supabase.activeStarterSkus}/${h.supabase.totalStarterSkus}`}
                    sub="active / total"
                />
                <Tile
                    icon={<Gauge className="w-4 h-4" />}
                    tone={h.supabase.totalSharedOutfits != null && h.supabase.totalSharedOutfits > 0 ? 'green' : 'muted'}
                    label="Shared outfits"
                    value={h.supabase.totalSharedOutfits == null ? '—' : h.supabase.totalSharedOutfits.toLocaleString()}
                    sub="public share cards"
                />
            </div>

            {/* Env vars */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                    <CloudCog className="w-4 h-4 text-black/40" />
                    <h2 className="text-sm font-bold text-[#1A1A1A]">Environment</h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-black/[0.05] text-black/45 tabular-nums ml-auto">
                        {Object.values(h.env).filter(Boolean).length}/{Object.keys(h.env).length} set
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <EnvRow label="Supabase URL" env="NEXT_PUBLIC_SUPABASE_URL" present={h.env.SUPABASE_URL} critical />
                    <EnvRow label="Supabase service role" env="SUPABASE_SERVICE_ROLE_KEY" present={h.env.SUPABASE_SERVICE_ROLE_KEY} critical />
                    <EnvRow label="Control password" env="CONTROL_PASSWORD" present={h.env.CONTROL_PASSWORD} critical />
                    <EnvRow label="Control signing key" env="CONTROL_SIGNING_KEY" present={h.env.CONTROL_SIGNING_KEY} critical />
                    <EnvRow label="Backend URL" env="NEXT_PUBLIC_BACKEND_URL" present={h.env.BACKEND_URL} />
                </div>
            </div>

            {/* Supabase counts */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-black/40" />
                    <h2 className="text-sm font-bold text-[#1A1A1A]">Table counts</h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-black/[0.05] text-black/45 tabular-nums ml-auto">
                        live
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Count k="Users" v={h.supabase.totalUsers} />
                    <Count k="Clothing items" v={h.supabase.totalItems} />
                    <Count k="Outfits" v={h.supabase.totalOutfits} />
                    <Count k="Starter SKUs (active)" v={h.supabase.activeStarterSkus} />
                    <Count k="Shared outfits" v={h.supabase.totalSharedOutfits} />
                    <Count k="Payments" v={h.supabase.totalPayments} />
                </div>

                {h.supabase.errors.length > 0 && (
                    <div className="mt-4 rounded-lg border border-[#CE1126]/20 bg-[#CE1126]/[0.04] p-3">
                        <p className="text-xs font-semibold text-[#CE1126] mb-1">Query errors</p>
                        <ul className="space-y-0.5 text-[11px] font-mono text-[#CE1126]/80">
                            {h.supabase.errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function Tile({ icon, tone, label, value, sub }: { icon: React.ReactNode; tone: 'green' | 'red' | 'gold' | 'muted'; label: string; value: string; sub?: string }) {
    const tones = {
        green: 'bg-emerald-500/10 text-emerald-700',
        red: 'bg-[#CE1126]/10 text-[#CE1126]',
        gold: 'bg-[#C4956A]/15 text-[#8B6B47]',
        muted: 'bg-black/[0.05] text-black/40',
    } as const;
    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones[tone]}`}>{icon}</span>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-black/40">{label}</p>
            </div>
            <p className="text-lg font-bold text-[#1A1A1A] tabular-nums">{value}</p>
            {sub && <p className="text-[11px] text-black/40 mt-0.5 truncate">{sub}</p>}
        </div>
    );
}

function EnvRow({ label, env, present, critical }: { label: string; env: string; present: boolean; critical?: boolean }) {
    return (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#F5F5F7] rounded-lg">
            {present ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
                <XCircle className="w-4 h-4 text-[#CE1126] shrink-0" />
            )}
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1A1A1A] truncate">{label}</p>
                <p className="text-[10px] font-mono text-black/35 truncate">{env}</p>
            </div>
            {critical && !present && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide bg-[#CE1126]/10 text-[#CE1126] shrink-0">
                    Critical
                </span>
            )}
            {!critical && !present && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide bg-black/[0.05] text-black/40 shrink-0">
                    Optional
                </span>
            )}
        </div>
    );
}

function Count({ k, v }: { k: string; v: number | null }) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/40">{k}</p>
            <p className="text-lg font-bold text-[#1A1A1A] tabular-nums mt-0.5">{v == null ? '—' : v.toLocaleString()}</p>
        </div>
    );
}
