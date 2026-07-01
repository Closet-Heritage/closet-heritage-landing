'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Gift, Megaphone, Wand2 } from 'lucide-react';
import { createPromoCodeAction, suggestCodeAction } from '@/app/control/actions/promo-codes';

type CodeType = 'referral' | 'ambassador' | 'gift' | 'promo';

const TYPE_PRESETS: Record<CodeType, {
    label: string;
    Icon: typeof Sparkles;
    hint: string;
    coinsRedeemer: number;
    coinsReferrer: number;
    defaultMax: number | null;
    showGift: boolean;
}> = {
    referral: { label: 'Referral',   Icon: Sparkles,    hint: 'Reward both parties when a friend redeems.',    coinsRedeemer: 10, coinsReferrer: 10, defaultMax: null, showGift: false },
    ambassador:{ label: 'Ambassador',Icon: ShieldCheck, hint: 'A named person owns the code and earns rewards.', coinsRedeemer: 10, coinsReferrer: 20, defaultMax: null, showGift: false },
    gift:      { label: 'Gift',       Icon: Gift,        hint: 'One-shot subscription grant.',                    coinsRedeemer: 0,  coinsReferrer: 0,  defaultMax: 1,    showGift: true  },
    promo:     { label: 'Promo',      Icon: Megaphone,   hint: 'Marketing / internal use.',                       coinsRedeemer: 20, coinsReferrer: 0,  defaultMax: 100,  showGift: false },
};

export function NewCodeForm() {
    const router = useRouter();
    const [type, setType] = useState<CodeType>('referral');
    const [code, setCode] = useState('');
    const [coinsRedeemer, setCoinsRedeemer] = useState(TYPE_PRESETS.referral.coinsRedeemer);
    const [coinsReferrer, setCoinsReferrer] = useState(TYPE_PRESETS.referral.coinsReferrer);
    const [maxUses, setMaxUses] = useState<string>('');
    const [expiresAt, setExpiresAt] = useState<string>('');
    const [giftPlan, setGiftPlan] = useState<string>('standard');
    const [giftDuration, setGiftDuration] = useState<string>('P1M'); // ISO 8601 duration
    const [recipientEmail, setRecipientEmail] = useState<string>('');
    const [ownerId, setOwnerId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const preset = TYPE_PRESETS[type];

    const changeType = (t: CodeType) => {
        setType(t);
        setCoinsRedeemer(TYPE_PRESETS[t].coinsRedeemer);
        setCoinsReferrer(TYPE_PRESETS[t].coinsReferrer);
        setMaxUses(TYPE_PRESETS[t].defaultMax?.toString() ?? '');
        setError(null);
    };

    const suggest = async () => {
        const c = await suggestCodeAction(type === 'ambassador' ? 'AMB' : type === 'gift' ? 'GIFT' : '');
        setCode(c);
    };

    const submit = () => {
        setError(null);
        startTransition(async () => {
            const res = await createPromoCodeAction({
                code,
                type,
                coinsRedeemer,
                coinsReferrer,
                maxUses: maxUses ? parseInt(maxUses, 10) : null,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
                giftPlan: preset.showGift ? giftPlan : null,
                giftDuration: preset.showGift ? giftDuration : null,
                recipientEmail: recipientEmail || null,
                ownerId: ownerId || null,
            });
            if (!res.ok) {
                setError(res.error ?? 'Failed to create code');
                return;
            }
            router.push('/control/promo-codes');
            router.refresh();
        });
    };

    return (
        <div className="space-y-5">
            {/* Type picker */}
            <div>
                <label className="ch-label">Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(TYPE_PRESETS) as CodeType[]).map((t) => {
                        const p = TYPE_PRESETS[t];
                        const active = type === t;
                        const Icon = p.Icon;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => changeType(t)}
                                className="rounded-xl border p-3 text-left transition-colors"
                                style={{
                                    borderColor: active ? 'var(--ch-accent)' : 'var(--ch-border)',
                                    background: active ? 'var(--ch-accent-tint)' : '#FFFFFF',
                                    color: active ? 'var(--ch-accent-dark)' : 'var(--ch-fg)',
                                }}
                            >
                                <Icon className="w-4 h-4 mb-1.5" />
                                <p className="text-[13px] font-semibold">{p.label}</p>
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs ch-muted mt-1.5">{preset.hint}</p>
            </div>

            {/* Code */}
            <div>
                <label className="ch-label">Code</label>
                <div className="flex gap-2">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. RYAN10 or GIFT-XY7"
                        className="ch-input font-mono uppercase"
                    />
                    <button type="button" onClick={suggest} className="ch-btn ch-btn--secondary">
                        <Wand2 className="w-3.5 h-3.5" /> Suggest
                    </button>
                </div>
                <p className="text-xs ch-muted mt-1.5">Case-insensitive at redemption; stored uppercase.</p>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="ch-label">Coins for redeemer</label>
                    <input type="number" min={0} value={coinsRedeemer} onChange={(e) => setCoinsRedeemer(parseInt(e.target.value || '0', 10))} className="ch-input" />
                </div>
                <div>
                    <label className="ch-label">Coins for referrer</label>
                    <input type="number" min={0} value={coinsReferrer} onChange={(e) => setCoinsReferrer(parseInt(e.target.value || '0', 10))} className="ch-input" />
                    <p className="text-[11px] ch-muted mt-1">Only meaningful for referral/ambassador.</p>
                </div>
            </div>

            {/* Gift-only */}
            {preset.showGift && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="ch-label">Gift plan</label>
                        <select value={giftPlan} onChange={(e) => setGiftPlan(e.target.value)} className="ch-input">
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <div>
                        <label className="ch-label">Duration (ISO 8601)</label>
                        <select value={giftDuration} onChange={(e) => setGiftDuration(e.target.value)} className="ch-input">
                            <option value="P1M">1 month</option>
                            <option value="P3M">3 months</option>
                            <option value="P6M">6 months</option>
                            <option value="P1Y">1 year</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Owner + recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="ch-label">Owner user ID <span className="ch-muted font-normal normal-case tracking-normal">(optional)</span></label>
                    <input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="uuid" className="ch-input font-mono text-[11px]" />
                    <p className="text-[11px] ch-muted mt-1">Required for ambassador — earns rewards.</p>
                </div>
                <div>
                    <label className="ch-label">Recipient email <span className="ch-muted font-normal normal-case tracking-normal">(optional)</span></label>
                    <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="person@example.com" className="ch-input" />
                    <p className="text-[11px] ch-muted mt-1">For targeted gifts.</p>
                </div>
            </div>

            {/* Uses + expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="ch-label">Max uses</label>
                    <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="unlimited" className="ch-input" />
                </div>
                <div>
                    <label className="ch-label">Expires at</label>
                    <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="ch-input" />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    {error}
                </div>
            )}

            <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={submit} disabled={pending || !code} className="ch-btn ch-btn--primary">
                    {pending ? 'Creating…' : 'Create code'}
                </button>
                <a href="/control/promo-codes" className="ch-btn ch-btn--ghost">Cancel</a>
            </div>
        </div>
    );
}
