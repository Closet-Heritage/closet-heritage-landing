export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Sparkles, CheckCircle2, Circle, Eye, EyeOff, Info, ExternalLink, AlertTriangle, Users as UsersIcon, ImageOff } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PersonaToggle, SkuToggle } from './toggles';
import { SkuImage, PersonaHero } from './sku-image';

type PersonaMeta = {
    label: string;
    blurb: string;
    gender: 'Female' | 'Male' | null;
    heroUrl: string | null;
    live: boolean;    // is the persona intended to be live right now
    darkReason?: string; // if not live, why
    docsHref?: string;
};

const PERSONA_META: Record<string, PersonaMeta> = {
    'warm-neutrals': {
        label: 'Warm Neutrals',
        blurb: 'Editorial earth-tones — cream silk, chocolate wide-leg, camel turtleneck. The signature "elevated everyday" look.',
        gender: 'Female',
        heroUrl: 'https://closetheritage.com/demo/avatars/warm-neutrals.png',
        live: true,
    },
    'bold-afrocentric': {
        label: 'Bold Afrocentric',
        blurb: 'Kente prints, cream statement heels, palazzo pants. For the woman who dresses like her heritage is a wardrobe.',
        gender: 'Female',
        heroUrl: 'https://closetheritage.com/demo/avatars/bold-afrocentric.png',
        live: true,
    },
    'modern-professional': {
        label: 'Modern Professional',
        blurb: 'Workwear that reads: I care about my mornings. Navy chinos, white dress shirt, brown derbys.',
        gender: 'Male',
        heroUrl: 'https://closetheritage.com/demo/avatars/modern-professional.png',
        live: true,
    },
    'smart-casual-weekend': {
        label: 'Smart Casual Weekend',
        blurb: 'Relaxed weekend uniform — cream oxford shirt, stone chinos, suede chukka boots. Ready to activate.',
        gender: 'Male',
        // Deliberately null while the landing redeploy is pending — the live
        // asset returns 404, so serving it as SSR src flashes a broken image
        // before the client-side onError fallback runs. The runbook link
        // below points at the exact unlock steps.
        heroUrl: null,
        live: false,
        darkReason: 'Hero image + all 9 SKU images need to be deployed to the live landing site first. The runbook has the exact unlock steps.',
        docsHref: '/control/docs/runbooks/unlock-scw',
    },
};

// Fallback for a persona_id that exists in the DB but has no metadata here.
// Defaults are conservative: no gender pill, treated as dark so a new
// persona never quietly appears as live.
const PERSONA_META_FALLBACK: PersonaMeta = {
    label: '(unmapped persona)',
    blurb: 'This persona is in the DB but has no metadata in `PERSONA_META`. Add an entry above to name it, describe it, and mark it live.',
    gender: null,
    heroUrl: null,
    live: false,
    darkReason: 'No metadata entry in PERSONA_META. Add one to control/(authed)/starter/page.tsx.',
};

async function getStarterData() {
    const sb = supabaseAdmin();

    // Fetch SKUs + seeded counts in parallel.
    const [skusRes, seededRes] = await Promise.all([
        sb.from('starter_clothing_skus')
            .select('sku_id, persona_id, gender, cropped_image_url, name, category, subcategory, primary_color, active')
            .order('persona_id')
            .order('sku_id'),
        // How many users currently own each starter SKU (source='starter').
        sb.from('clothing_items')
            .select('starter_sku_id')
            .eq('source', 'starter')
            .not('starter_sku_id', 'is', null),
    ]);

    if (skusRes.error) return { personas: [], error: skusRes.error.message };

    const seededBySku = new Map<string, number>();
    for (const row of seededRes.data ?? []) {
        const k = row.starter_sku_id as string;
        seededBySku.set(k, (seededBySku.get(k) ?? 0) + 1);
    }

    // Group by persona
    type Sku = typeof skusRes.data extends (infer T)[] | null ? T : never;
    const grouped = new Map<string, {
        personaId: string;
        skus: Sku[];
        activeCount: number;
        totalCount: number;
        seededPickers: Set<string>; // approximate — total pickers via profiles is elsewhere
        seededByThisPersona: number;
    }>();
    for (const row of skusRes.data ?? []) {
        const p = row.persona_id as string;
        if (!grouped.has(p)) grouped.set(p, {
            personaId: p, skus: [], activeCount: 0, totalCount: 0, seededPickers: new Set(), seededByThisPersona: 0,
        });
        const b = grouped.get(p)!;
        b.skus.push(row);
        b.totalCount += 1;
        if (row.active) b.activeCount += 1;
        b.seededByThisPersona += seededBySku.get(row.sku_id as string) ?? 0;
    }

    // Now enrich with persona-picker counts from profiles.starter_persona_id.
    const { data: pickerCounts } = await sb
        .from('profiles')
        .select('starter_persona_id')
        .not('starter_persona_id', 'is', null);
    const pickersByPersona = new Map<string, number>();
    for (const p of pickerCounts ?? []) {
        const k = p.starter_persona_id as string;
        pickersByPersona.set(k, (pickersByPersona.get(k) ?? 0) + 1);
    }

    return {
        personas: Array.from(grouped.values()).map((g) => ({
            ...g,
            pickerCount: pickersByPersona.get(g.personaId) ?? 0,
            seededBySku,
        })),
        error: null,
    };
}

export default async function StarterPage() {
    const { personas, error } = await getStarterData();

    // Sort: live personas first, then dark ones. Unmapped personas (no meta
    // entry) count as dark so an accidental new persona_id in the DB doesn't
    // get promoted above intentional ones.
    const orderedPersonas = [...personas].sort((a, b) => {
        const am = PERSONA_META[a.personaId]?.live === true ? 0 : 1;
        const bm = PERSONA_META[b.personaId]?.live === true ? 0 : 1;
        return am - bm;
    });

    const totalSkus = personas.reduce((s, p) => s + p.totalCount, 0);
    const activeSkus = personas.reduce((s, p) => s + p.activeCount, 0);
    const totalPickers = personas.reduce((s, p) => s + p.pickerCount, 0);

    return (
        <div className="max-w-[1200px] space-y-6">
            {/* Header */}
            <header className="flex items-start gap-4">
                <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--ch-accent-tint)', color: 'var(--ch-accent-dark)' }}
                >
                    <Sparkles className="w-5 h-5" />
                </span>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Starter wardrobe</h1>
                    <p className="text-sm ch-soft mt-1">
                        {totalPickers.toLocaleString()} users have picked a persona · {activeSkus} of {totalSkus} pieces live · 4 personas total
                    </p>
                </div>
            </header>

            {/* Explainer — "how this works" */}
            <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--ch-cream-elevated)', border: '1px solid var(--ch-border)' }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4" style={{ color: 'var(--ch-accent-dark)' }} />
                    <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--ch-fg)' }}>
                        How this works
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-[13px]">
                    <ExplainCard
                        icon={<Eye className="w-4 h-4" />}
                        tone="success"
                        title='"Live" means offered'
                        body="A live piece is included in the 9-piece set new users see during onboarding. All 9 must be live for the persona to be picked cleanly."
                    />
                    <ExplainCard
                        icon={<EyeOff className="w-4 h-4" />}
                        tone="muted"
                        title={`"Hidden" means new users don't see it`}
                        body="Hiding a piece removes it from future offerings. Users who already picked it keep it in their closet — nothing is deleted, ever."
                    />
                    <ExplainCard
                        icon={<UsersIcon className="w-4 h-4" />}
                        tone="gold"
                        title="Safe to toggle"
                        body="Every toggle is reversible. The audit log records who changed what. Perfect for staging launches or rolling back a persona."
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            <div className="space-y-8">
                {orderedPersonas.map((p) => {
                    const meta = PERSONA_META[p.personaId] ?? { ...PERSONA_META_FALLBACK, label: p.personaId };
                    const allActive = p.activeCount === p.totalCount;
                    const allOff = p.activeCount === 0;

                    return (
                        <section key={p.personaId} className="ch-card overflow-hidden">
                            {/* Persona header */}
                            <div className="flex flex-col md:flex-row" style={{ background: 'var(--ch-cream)', borderBottom: '1px solid var(--ch-border)' }}>
                                {/* Hero image */}
                                <div className="relative w-full md:w-[220px] h-[180px] md:h-auto shrink-0" style={{ background: 'var(--ch-cream-elevated)' }}>
                                    <PersonaHero src={meta.heroUrl} personaLabel={meta.label} />
                                </div>
                                {/* Info + toggles */}
                                <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>
                                                {meta.label}
                                            </h2>
                                            {meta.gender && <span className="ch-pill ch-pill--muted">{meta.gender}</span>}
                                            {allActive ? (
                                                <span className="ch-pill ch-pill--ok"><CheckCircle2 className="w-3 h-3" /> live</span>
                                            ) : allOff ? (
                                                <span className="ch-pill ch-pill--muted"><Circle className="w-3 h-3" /> dark</span>
                                            ) : (
                                                <span className="ch-pill ch-pill--warn">partial · {p.activeCount}/{p.totalCount} shown</span>
                                            )}
                                        </div>
                                        <p className="text-[13.5px] ch-soft leading-relaxed">{meta.blurb}</p>
                                    </div>

                                    <div className="flex items-end justify-between gap-4 flex-wrap">
                                        <div className="flex gap-5 text-[11px]">
                                            <StatBadge label="pickers so far" value={p.pickerCount.toLocaleString()} />
                                            <StatBadge label="pieces live" value={`${p.activeCount}/${p.totalCount}`} />
                                            <StatBadge label="items in closets" value={p.seededByThisPersona.toLocaleString()} />
                                        </div>
                                        <PersonaToggle
                                            personaId={p.personaId}
                                            personaLabel={meta.label}
                                            allActive={allActive}
                                            allOff={allOff}
                                            activeCount={p.activeCount}
                                            totalCount={p.totalCount}
                                            seededCount={p.pickerCount}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dark reason banner */}
                            {!meta.live && (
                                <div
                                    className="flex items-start gap-3 px-5 py-3.5"
                                    style={{ background: 'var(--ch-warn-tint)', borderBottom: '1px solid var(--ch-border)' }}
                                >
                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--ch-warn)' }} />
                                    <div className="flex-1">
                                        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--ch-warn)' }}>
                                            This persona is intentionally dark
                                        </p>
                                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--ch-warn)', opacity: 0.85 }}>
                                            {meta.darkReason}
                                        </p>
                                    </div>
                                    {meta.docsHref && (
                                        <Link
                                            href={meta.docsHref}
                                            className="ch-btn ch-btn--secondary shrink-0"
                                        >
                                            Open runbook <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* SKU grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 p-5">
                                {p.skus.map((sku) => {
                                    const seededCount = p.seededBySku.get(sku.sku_id as string) ?? 0;
                                    return (
                                        <div
                                            key={sku.sku_id}
                                            className="rounded-xl overflow-hidden transition-all"
                                            style={{
                                                background: '#FFFFFF',
                                                border: `1px solid ${sku.active ? 'var(--ch-border)' : 'var(--ch-border)'}`,
                                                boxShadow: sku.active ? '0 1px 3px rgba(41, 26, 12, 0.06)' : 'none',
                                                opacity: sku.active ? 1 : 0.65,
                                            }}
                                        >
                                            <div
                                                className="aspect-square relative"
                                                style={{ background: 'var(--ch-cream-elevated)' }}
                                            >
                                                <SkuImage
                                                    src={sku.cropped_image_url as string | null}
                                                    alt={(sku.name as string) || (sku.sku_id as string)}
                                                    label={(sku.name as string) || (sku.sku_id as string)}
                                                />
                                                {!sku.active && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="ch-pill ch-pill--muted">
                                                            <EyeOff className="w-3 h-3" /> hidden
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 space-y-2">
                                                <div>
                                                    <p className="text-[13.5px] font-semibold leading-tight truncate" style={{ color: 'var(--ch-fg)' }}>
                                                        {sku.name || sku.sku_id}
                                                    </p>
                                                    <p className="text-[11px] ch-muted truncate mt-0.5">
                                                        {sku.category} · {sku.primary_color}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span
                                                        className="text-[10.5px] font-medium flex items-center gap-1 shrink-0"
                                                        style={{ color: 'var(--ch-fg-3)' }}
                                                        title={`${seededCount.toLocaleString()} user${seededCount === 1 ? '' : 's'} currently ${seededCount === 1 ? 'has' : 'have'} this piece in their wardrobe`}
                                                    >
                                                        <UsersIcon className="w-3 h-3" /> {seededCount}
                                                    </span>
                                                    <div className="flex-1 max-w-[85px]">
                                                        <SkuToggle
                                                            skuId={sku.sku_id as string}
                                                            skuName={sku.name as string | null}
                                                            active={!!sku.active}
                                                            seededCount={seededCount}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────

function ExplainCard({
    icon,
    title,
    body,
    tone,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
    tone: 'success' | 'muted' | 'gold';
}) {
    const bg =
        tone === 'success' ? 'var(--ch-success-tint)' :
        tone === 'gold' ? 'var(--ch-accent-tint)' :
        'rgba(41, 26, 12, 0.04)';
    const fg =
        tone === 'success' ? 'var(--ch-success)' :
        tone === 'gold' ? 'var(--ch-accent-dark)' :
        'var(--ch-fg-2)';

    return (
        <div className="rounded-xl p-3.5" style={{ background: '#FFFFFF', border: '1px solid var(--ch-border)' }}>
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: bg, color: fg }}>
                    {icon}
                </span>
                <p className="text-[13px] font-bold" style={{ color: 'var(--ch-fg)' }}>{title}</p>
            </div>
            <p className="text-[12.5px] leading-relaxed ch-soft">{body}</p>
        </div>
    );
}

function StatBadge({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[9.5px] font-bold uppercase tracking-widest ch-muted">{label}</p>
            <p className="text-[16px] font-bold tabular-nums mt-0.5" style={{ color: 'var(--ch-fg)' }}>{value}</p>
        </div>
    );
}
