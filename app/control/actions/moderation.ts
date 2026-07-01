'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAudit, requireSession } from '../audit';

/** Toggle `outfit_comments.is_hidden`. */
export async function setCommentHiddenAction(commentId: string, isHidden: boolean) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    const { error } = await sb.from('outfit_comments').update({ is_hidden: isHidden }).eq('id', commentId);

    await logAudit(session, {
        action: isHidden ? 'comment.hide' : 'comment.unhide',
        targetType: 'comment',
        targetId: commentId,
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/reports');
    return { ok: true as const };
}

/** Hard-delete a comment. CASCADE also removes its reports. */
export async function deleteCommentAction(commentId: string) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    const { error } = await sb.from('outfit_comments').delete().eq('id', commentId);

    await logAudit(session, {
        action: 'comment.delete',
        targetType: 'comment',
        targetId: commentId,
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/reports');
    return { ok: true as const };
}

/**
 * Ban an auth.users id for a very long time. Their existing content stays;
 * they just can't sign in. Reversible via Supabase dashboard.
 * Anonymous fingerprint bans are not implemented here — those live per-share.
 */
export async function banAuthUserAction(userId: string) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    // Supabase-js supports updating banned_until via admin. Use 100y so the
    // future date is treated as permanent by every downstream check.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb.auth.admin as any).updateUserById(userId, {
        ban_duration: '876000h', // 100 years
    });

    await logAudit(session, {
        action: 'user.ban',
        targetType: 'user',
        targetId: userId,
        details: { duration: '100y' },
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/reports');
    revalidatePath(`/control/users/${userId}`);
    return { ok: true as const };
}
