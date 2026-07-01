'use client';

import { useState, useTransition } from 'react';
import { Send, TestTube2, Bell, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { broadcastPushAction } from '@/app/control/actions/broadcast';

const PRESET_MESSAGES = [
    { title: '', body: '' },
    { title: 'New feature: try-on', body: 'See yourself in outfits from your closet in seconds.' },
    { title: 'Come back to your closet', body: 'You have unworn items that would look great this week.' },
    { title: 'Fresh outfits ready', body: 'Tap to see today\'s pick from your wardrobe.' },
];

/**
 * Screen slugs the mobile app's `usePushNotifications` listener actually
 * handles. Any other value is ignored on tap — the app opens normally.
 * Verified against closet-heritage-app/hooks/usePushNotifications.ts.
 */
const SCREEN_OPTIONS = [
    { value: '', label: 'None — just open the app' },
    { value: 'daily-recs', label: 'Daily recommendations' },
    { value: 'outfits', label: 'Outfits tab' },
] as const;

export function BroadcastForm() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [screen, setScreen] = useState<string>('');
    const [userIdsRaw, setUserIdsRaw] = useState('');
    const [result, setResult] = useState<null | { ok: boolean; message: string; details?: React.ReactNode }>(null);
    const [pending, startTransition] = useTransition();

    const userIds = userIdsRaw.split(/[,\s\n]+/).map((s) => s.trim()).filter(Boolean);
    const disabled = pending || !title.trim() || !body.trim();

    const submit = (dryRun: boolean) => {
        setResult(null);
        if (!dryRun) {
            const scope = userIds.length ? `${userIds.length} specific user${userIds.length > 1 ? 's' : ''}` : 'EVERY registered device';
            if (!confirm(`Send this push to ${scope}?\n\n"${title}"\n${body}\n\nThis cannot be undone.`)) return;
        }
        startTransition(async () => {
            const res = await broadcastPushAction({
                title: title.trim(),
                body: body.trim(),
                screen: screen || undefined,
                userIds,
                dryRun,
            });
            if (!res.ok) {
                setResult({ ok: false, message: res.error ?? 'Failed' });
                return;
            }
            if (res.dryRun) {
                setResult({
                    ok: true,
                    message: `Dry run — would target ${res.targetedCount.toLocaleString()} devices`,
                });
            } else {
                const prunedNote = (res.pruned ?? 0) > 0 ? ` · ${res.pruned} dead tokens pruned` : '';
                setResult({
                    ok: (res.failed ?? 0) === 0,
                    message: `Sent to ${res.sent?.toLocaleString() ?? 0} / ${res.targetedCount.toLocaleString()} devices${prunedNote}`,
                    details: (res.failed ?? 0) > 0 && res.firstError ? (
                        <span className="font-mono text-[11px]">First error: {res.firstError}</span>
                    ) : null,
                });
                if ((res.failed ?? 0) === 0) {
                    setTimeout(() => setResult(null), 8000);
                }
            }
        });
    };

    const selectedScreenLabel = SCREEN_OPTIONS.find((s) => s.value === screen)?.label ?? screen;

    return (
        <div className="ch-card p-5 space-y-4">
            {/* Preset picker */}
            <div>
                <label className="ch-label">Start from</label>
                <div className="flex gap-1.5 flex-wrap">
                    {PRESET_MESSAGES.map((p, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => { setTitle(p.title); setBody(p.body); }}
                            className="ch-btn ch-btn--secondary !py-1 !px-2 !text-[11px]"
                        >
                            {i === 0 ? 'Blank' : p.title}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="ch-label">Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={65}
                    placeholder="Short and warm — this is what shows above the body"
                    className="ch-input"
                />
                <p className="text-[11px] ch-muted mt-1 tabular-nums">{title.length}/65 chars</p>
            </div>
            <div>
                <label className="ch-label">Body</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={240}
                    rows={3}
                    placeholder="One sentence, plain language."
                    className="ch-input"
                />
                <p className="text-[11px] ch-muted mt-1 tabular-nums">{body.length}/240 chars</p>
            </div>
            <div>
                <label className="ch-label">Open on tap</label>
                <select
                    value={screen}
                    onChange={(e) => setScreen(e.target.value)}
                    className="ch-input"
                >
                    {SCREEN_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <p className="text-[11px] ch-muted mt-1">
                    Passed to the app as <span className="ch-kbd">data.screen</span>. Only the sanctioned slugs above are handled by <span className="ch-kbd">usePushNotifications.ts</span>.
                </p>
            </div>

            <details className="rounded-lg" style={{ background: 'var(--ch-cream)', border: '1px solid var(--ch-border)' }}>
                <summary className="cursor-pointer px-3 py-2 text-[12px] font-semibold ch-soft">
                    Target specific users? <span className="ch-muted font-normal">— defaults to everyone</span>
                </summary>
                <div className="px-3 pb-3">
                    <textarea
                        value={userIdsRaw}
                        onChange={(e) => setUserIdsRaw(e.target.value)}
                        rows={3}
                        placeholder="Paste user UUIDs, one per line"
                        className="ch-input font-mono text-[11.5px]"
                    />
                    <p className="text-[11px] ch-muted mt-1">
                        {userIds.length > 0 ? `Will target ${userIds.length} user${userIds.length > 1 ? 's' : ''}` : 'Empty = every registered device'}
                    </p>
                </div>
            </details>

            {/* Preview */}
            {(title || body) && (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--ch-cream)', border: '1px dashed var(--ch-border-strong)' }}>
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--ch-accent)', color: '#1A0F08' }}>
                        <Bell className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: 'var(--ch-fg)' }}>{title || 'Title preview…'}</p>
                        <p className="text-[13px] ch-soft mt-0.5">{body || 'Body preview…'}</p>
                        {screen && (
                            <p className="text-[11px] mt-1 flex items-center gap-1 ch-muted">
                                <ExternalLink className="w-3 h-3" /> tap opens: <span className="font-mono">{selectedScreenLabel}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {result && (
                <div
                    className="rounded-lg border px-3.5 py-2.5"
                    style={{
                        borderColor: result.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                        background: result.ok ? 'var(--ch-success-tint)' : 'var(--ch-danger-tint)',
                        color: result.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                    }}
                >
                    <p className="text-[12.5px] font-semibold flex items-center gap-1.5">
                        {result.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {result.message}
                    </p>
                    {result.details && <p className="text-[11px] mt-1.5">{result.details}</p>}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => submit(true)} disabled={disabled} className="ch-btn ch-btn--secondary">
                    <TestTube2 className="w-3.5 h-3.5" /> {pending ? '…' : 'Dry run'}
                </button>
                <button onClick={() => submit(false)} disabled={disabled} className="ch-btn ch-btn--danger">
                    <Send className="w-3.5 h-3.5" /> {pending ? 'Sending…' : 'Send broadcast'}
                </button>
            </div>
        </div>
    );
}
