'use client';

import { useState, useTransition } from 'react';
import { Coins, ShieldOff, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { grantCoinsAction, banUserAction, deleteUserAction } from '@/app/control/actions/users';

export function UserActions({ userId, userName }: { userId: string; userName: string | null }) {
    const [showGrant, setShowGrant] = useState(false);
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('');
    const [pending, startTransition] = useTransition();
    const [flash, setFlash] = useState<{ ok: boolean; message: string } | null>(null);

    const label = userName || `user ${userId.slice(0, 8)}`;

    const show = (ok: boolean, message: string) => {
        setFlash({ ok, message });
        setTimeout(() => setFlash(null), 3500);
    };

    const grant = () => {
        if (!reason.trim()) {
            show(false, 'Reason is required (goes into the audit log)');
            return;
        }
        startTransition(async () => {
            const res = await grantCoinsAction(userId, amount, reason);
            if (res.ok) {
                show(true, `Adjusted balance by ${amount > 0 ? '+' : ''}${amount} coins`);
                setShowGrant(false);
                setAmount(10);
                setReason('');
            } else {
                show(false, res.error ?? 'Failed');
            }
        });
    };

    const ban = () => {
        if (!confirm(`Ban ${label}? They lose sign-in for 100 years (reversible via Supabase dashboard).`)) return;
        startTransition(async () => {
            const res = await banUserAction(userId);
            show(res.ok, res.ok ? 'User banned' : (res.error ?? 'Failed'));
        });
    };

    const del = () => {
        if (!confirm(`Delete ${label}'s account permanently? This CASCADEs through wardrobe, outfits, subscriptions — cannot be undone.`)) return;
        if (!confirm('Really? Type YES DELETE in the next box to confirm.')) return;
        const c = prompt('Type YES DELETE to confirm:');
        const phrase = (c ?? '').trim();
        if (phrase !== 'YES DELETE') { show(false, 'Cancelled'); return; }
        startTransition(async () => {
            const res = await deleteUserAction(userId, phrase);
            show(res.ok, res.ok ? 'User deleted — redirecting…' : (res.error ?? 'Failed'));
            if (res.ok) setTimeout(() => { window.location.href = '/control/users'; }, 800);
        });
    };

    return (
        <div className="ch-card p-3.5 flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider ch-muted mr-2">Actions</p>
            <button onClick={() => setShowGrant(true)} className="ch-btn ch-btn--secondary">
                <Coins className="w-3 h-3" /> Grant coins…
            </button>
            <button onClick={ban} disabled={pending} className="ch-btn ch-btn--danger">
                <ShieldOff className="w-3 h-3" /> Ban
            </button>
            <button onClick={del} disabled={pending} className="ch-btn ch-btn--danger">
                <Trash2 className="w-3 h-3" /> Delete account
            </button>

            {flash && (
                <span
                    className="ch-pill ml-auto"
                    style={{
                        background: flash.ok ? 'var(--ch-success-tint)' : 'var(--ch-danger-tint)',
                        color: flash.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                    }}
                >
                    {flash.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {flash.message}
                </span>
            )}

            {showGrant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(41, 26, 12, 0.4)' }}>
                    <div className="ch-card w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--ch-border)' }}>
                            <h2 className="text-sm font-bold" style={{ color: 'var(--ch-fg)' }}>Adjust coin balance</h2>
                            <button onClick={() => setShowGrant(false)} className="ch-btn ch-btn--ghost !p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-xs ch-soft">
                                For <span className="font-semibold" style={{ color: 'var(--ch-fg)' }}>{label}</span>. Positive = grant. Negative = claw back. Every adjustment is logged.
                            </p>
                            <div>
                                <label className="ch-label">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value || '0', 10))}
                                    className="ch-input"
                                />
                                <div className="flex gap-1.5 mt-2">
                                    {[5, 10, 25, 50, 100].map((n) => (
                                        <button key={n} type="button" onClick={() => setAmount(n)} className="ch-btn ch-btn--secondary !py-1 !px-2 !text-[11px]">
                                            +{n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="ch-label">Reason <span className="ch-danger" style={{ color: 'var(--ch-danger)' }}>*</span></label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    placeholder="e.g. compensation for failed try-on on 2026-07-01"
                                    className="ch-input"
                                />
                                <p className="text-[11px] ch-muted mt-1">Goes into the audit log — be specific enough that a future you can reconstruct why.</p>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setShowGrant(false)} className="ch-btn ch-btn--ghost">Cancel</button>
                                <button onClick={grant} disabled={pending} className="ch-btn ch-btn--primary">
                                    {pending ? 'Applying…' : `Apply ${amount > 0 ? '+' : ''}${amount} coins`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
