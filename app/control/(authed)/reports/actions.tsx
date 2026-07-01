'use client';

import { useState, useTransition } from 'react';
import { EyeOff, Eye, Trash2, ShieldOff, CheckCircle2, XCircle } from 'lucide-react';
import { setCommentHiddenAction, deleteCommentAction, banAuthUserAction } from '@/app/control/actions/moderation';

export function ReportActions({
    commentId,
    commenterUserId,
    isHidden,
}: {
    commentId: string;
    commenterUserId: string | null;
    isHidden: boolean;
}) {
    const [pending, startTransition] = useTransition();
    const [flash, setFlash] = useState<{ ok: boolean; message: string } | null>(null);

    const show = (ok: boolean, message: string) => {
        setFlash({ ok, message });
        setTimeout(() => setFlash(null), 2500);
    };

    const doHide = () => {
        startTransition(async () => {
            const res = await setCommentHiddenAction(commentId, !isHidden);
            show(res.ok, res.ok ? (isHidden ? 'Comment unhidden' : 'Comment hidden') : (res.error ?? 'Failed'));
        });
    };
    const doDelete = () => {
        if (!confirm('Delete this comment permanently? This cannot be undone.')) return;
        startTransition(async () => {
            const res = await deleteCommentAction(commentId);
            show(res.ok, res.ok ? 'Comment deleted' : (res.error ?? 'Failed'));
        });
    };
    const doBan = () => {
        if (!commenterUserId) return;
        if (!confirm(`Ban this commenter's account? They lose sign-in for 100 years (effectively permanent). Reversible via Supabase dashboard.`)) return;
        startTransition(async () => {
            const res = await banAuthUserAction(commenterUserId);
            show(res.ok, res.ok ? 'Commenter banned' : (res.error ?? 'Failed'));
        });
    };

    return (
        <>
            <button onClick={doHide} disabled={pending} className="ch-btn ch-btn--secondary">
                {isHidden ? <><Eye className="w-3 h-3" /> Unhide</> : <><EyeOff className="w-3 h-3" /> Hide</>}
            </button>
            <button onClick={doDelete} disabled={pending} className="ch-btn ch-btn--danger">
                <Trash2 className="w-3 h-3" /> Delete
            </button>
            {commenterUserId && (
                <button onClick={doBan} disabled={pending} className="ch-btn ch-btn--danger">
                    <ShieldOff className="w-3 h-3" /> Ban commenter
                </button>
            )}
            {flash && (
                <span
                    className="ch-pill ml-2"
                    style={{
                        background: flash.ok ? 'var(--ch-success-tint)' : 'var(--ch-danger-tint)',
                        color: flash.ok ? 'var(--ch-success)' : 'var(--ch-danger)',
                    }}
                >
                    {flash.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {flash.message}
                </span>
            )}
        </>
    );
}
