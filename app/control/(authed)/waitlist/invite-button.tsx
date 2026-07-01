'use client';

import { useState, useTransition } from 'react';
import { Send, X, ChevronDown, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { sendInvitesAction } from '@/app/control/actions/waitlist';

const DEFAULT_TESTFLIGHT = 'https://testflight.apple.com/join/CLOSETHERITAGE';
const DEFAULT_PLAYSTORE = 'https://play.google.com/store/apps/details?id=com.closetheritage.app';

/**
 * Two-tier UX:
 *   • Quick action: "Send to all N uninvited" — fires a single confirm and goes.
 *   • Advanced menu: pick specific emails, override URLs, then send.
 *
 * The original build had a single button that opened a modal you had to fill
 * out for the common case. Most of the time you just want to blast the whole
 * queue with the default URLs, so that path is now one click + one confirm.
 */
export function InviteButton({ uninvitedCount }: { uninvitedCount: number }) {
    const [advanced, setAdvanced] = useState(false);
    const [emails, setEmails] = useState('');
    const [testFlightUrl, setTestFlightUrl] = useState(DEFAULT_TESTFLIGHT);
    const [playStoreUrl, setPlayStoreUrl] = useState(DEFAULT_PLAYSTORE);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
    const [pending, startTransition] = useTransition();

    const emailList = emails.split(/[,\s\n]+/).map((e) => e.trim()).filter(Boolean);

    const flashResult = (ok: boolean, message: string) => {
        setResult({ ok, message });
        if (ok) setTimeout(() => setResult(null), 4000);
    };

    const send = (specificEmails: string[]) => {
        startTransition(async () => {
            const res = await sendInvitesAction({
                emails: specificEmails,
                testFlightUrl,
                playStoreUrl,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sent = (res as any).response?.sent ?? (res as any).response?.count ?? specificEmails.length;
            if (res.ok) {
                flashResult(true, `✓ Invites sent${sent ? ` (${sent})` : ''}`);
                setEmails('');
                setAdvanced(false);
                // Force page refresh so the invited_at columns update
                setTimeout(() => window.location.reload(), 1200);
            } else {
                flashResult(false, res.error ?? 'Failed to send');
            }
        });
    };

    const quickSend = () => {
        if (uninvitedCount === 0) return;
        if (!confirm(`Send invites to all ${uninvitedCount.toLocaleString()} waiting people?\n\nUses:\n  TestFlight: ${DEFAULT_TESTFLIGHT}\n  Play Store: ${DEFAULT_PLAYSTORE}\n\nThis fires real emails via Resend and cannot be undone.`)) return;
        send([]);
    };

    const advancedSend = () => {
        const target = emailList.length || uninvitedCount;
        if (!confirm(`Send invites to ${target.toLocaleString()} ${target === 1 ? 'person' : 'people'}? Fires real email.`)) return;
        send(emailList);
    };

    return (
        <div className="flex items-start gap-2 flex-wrap">
            {/* Primary action: quick-send. Split button — click "Send…" to fire directly, chevron for advanced. */}
            <div className="inline-flex rounded-md overflow-hidden" style={{ boxShadow: uninvitedCount > 0 ? '0 1px 2px rgba(41,26,12,0.10)' : undefined }}>
                <button
                    type="button"
                    onClick={quickSend}
                    disabled={pending || uninvitedCount === 0}
                    className="ch-btn ch-btn--primary !rounded-r-none"
                    title={uninvitedCount === 0 ? 'Nobody is waiting' : `Send to all ${uninvitedCount} uninvited`}
                >
                    <Send className="w-3.5 h-3.5" />
                    {pending && !advanced ? 'Sending…' : (
                        uninvitedCount === 0 ? 'No one waiting' : `Send to all ${uninvitedCount.toLocaleString()}`
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setAdvanced(true)}
                    disabled={pending}
                    className="ch-btn ch-btn--primary !rounded-l-none !border-l"
                    style={{ borderLeftColor: 'rgba(245, 233, 221, 0.15)' }}
                    title="Send to specific addresses / override URLs"
                >
                    <ChevronDown className="w-3.5 h-3.5" />
                </button>
            </div>

            {result && !advanced && (
                <span
                    className="ch-pill"
                    style={{
                        background: result.ok ? 'var(--ch-success-tint)' : 'var(--ch-danger-tint)',
                        color: result.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                    }}
                >
                    {result.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {result.message}
                </span>
            )}

            {/* Advanced modal */}
            {advanced && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(41, 26, 12, 0.4)' }}>
                    <div className="ch-card w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--ch-border)' }}>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" style={{ color: 'var(--ch-accent-dark)' }} />
                                <h2 className="text-sm font-bold" style={{ color: 'var(--ch-fg)' }}>Send waitlist invites</h2>
                            </div>
                            <button onClick={() => setAdvanced(false)} className="ch-btn ch-btn--ghost !p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="ch-label">
                                    Specific emails <span className="normal-case ch-muted font-normal tracking-normal">(one per line — blank = all {uninvitedCount} uninvited)</span>
                                </label>
                                <textarea
                                    value={emails}
                                    onChange={(e) => setEmails(e.target.value)}
                                    rows={5}
                                    placeholder="person1@example.com&#10;person2@example.com"
                                    className="ch-input font-mono text-[12px]"
                                />
                            </div>
                            <div>
                                <label className="ch-label">TestFlight URL</label>
                                <input value={testFlightUrl} onChange={(e) => setTestFlightUrl(e.target.value)} className="ch-input font-mono text-[12px]" />
                            </div>
                            <div>
                                <label className="ch-label">Play Store URL</label>
                                <input value={playStoreUrl} onChange={(e) => setPlayStoreUrl(e.target.value)} className="ch-input font-mono text-[12px]" />
                            </div>

                            {result && (
                                <div
                                    className="rounded-lg border px-3 py-2 text-[12.5px]"
                                    style={{
                                        borderColor: result.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                                        background: result.ok ? 'var(--ch-success-tint)' : 'var(--ch-danger-tint)',
                                        color: result.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                                    }}
                                >
                                    {result.message}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-[11px] ch-muted">
                                    Sending to <span className="font-bold" style={{ color: 'var(--ch-fg)' }}>{(emailList.length || uninvitedCount).toLocaleString()}</span> {(emailList.length || uninvitedCount) === 1 ? 'person' : 'people'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAdvanced(false)} className="ch-btn ch-btn--ghost">Cancel</button>
                                    <button onClick={advancedSend} disabled={pending || (emailList.length === 0 && uninvitedCount === 0)} className="ch-btn ch-btn--primary">
                                        <Send className="w-3.5 h-3.5" />
                                        {pending ? 'Sending…' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
