'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAudit, requireSession } from '../audit';

const CODE_ALPHABET = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity

function randomCode(n = 8): string {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    let out = '';
    for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
    return out;
}

type CreatePromoInput = {
    code: string;
    type: 'referral' | 'ambassador' | 'gift' | 'promo';
    coinsReferrer: number;
    coinsRedeemer: number;
    maxUses: number | null;
    expiresAt: string | null;   // ISO
    giftPlan: string | null;
    giftDuration: string | null;
    recipientEmail: string | null;
    ownerId: string | null;
};

/** Create a new promo code. Returns { ok, code?, error? }. */
export async function createPromoCodeAction(input: CreatePromoInput) {
    const session = await requireSession();
    const sb = supabaseAdmin();

    const code = input.code.trim().toUpperCase();
    if (!code || code.length < 3) {
        return { ok: false as const, error: 'Code must be at least 3 characters' };
    }

    const payload = {
        code,
        type: input.type,
        owner_id: input.ownerId,
        coins_referrer: Math.max(0, Math.floor(input.coinsReferrer || 0)),
        coins_redeemer: Math.max(0, Math.floor(input.coinsRedeemer || 0)),
        gift_plan: input.giftPlan,
        gift_duration: input.giftDuration,
        max_uses: input.maxUses && input.maxUses > 0 ? input.maxUses : null,
        current_uses: 0,
        requires_action: 'first_upload',
        recipient_email: input.recipientEmail,
        expires_at: input.expiresAt,
        is_active: true,
    };

    const { data, error } = await sb.from('promo_codes').insert(payload).select('id, code').single();

    if (error) {
        await logAudit(session, {
            action: 'promo_code.create',
            targetType: 'promo_code',
            targetId: code,
            details: { input: payload },
            ok: false,
            error: error.message,
        });
        return { ok: false as const, error: error.message };
    }

    await logAudit(session, {
        action: 'promo_code.create',
        targetType: 'promo_code',
        targetId: data.id,
        details: { code: data.code, type: input.type },
    });

    revalidatePath('/control/promo-codes');
    return { ok: true as const, code: data.code, id: data.id };
}

/** Toggle an existing code active/inactive. */
export async function togglePromoCodeAction(id: string, isActive: boolean) {
    const session = await requireSession();
    const sb = supabaseAdmin();

    const { error } = await sb.from('promo_codes').update({ is_active: isActive }).eq('id', id);

    await logAudit(session, {
        action: isActive ? 'promo_code.activate' : 'promo_code.deactivate',
        targetType: 'promo_code',
        targetId: id,
        ok: !error,
        error: error?.message,
    });

    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/promo-codes');
    return { ok: true as const };
}

/** Generate a random code candidate — used to populate the form field. */
export async function suggestCodeAction(prefix?: string): Promise<string> {
    void (await requireSession());
    const clean = (prefix ?? '').trim().toUpperCase().slice(0, 4).replace(/[^A-Z0-9]/g, '');
    return clean ? `${clean}-${randomCode(4)}` : randomCode(8);
}
