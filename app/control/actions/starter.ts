'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAudit, requireSession } from '../audit';

/** Toggle a single SKU. */
export async function setSkuActiveAction(skuId: string, active: boolean) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    const { error } = await sb.from('starter_clothing_skus').update({ active }).eq('sku_id', skuId);
    await logAudit(session, {
        action: active ? 'starter_sku.activate' : 'starter_sku.deactivate',
        targetType: 'starter_sku',
        targetId: skuId,
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/starter');
    return { ok: true as const };
}

/** Toggle every SKU of a persona at once. */
export async function setPersonaActiveAction(personaId: string, active: boolean) {
    const session = await requireSession();
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('starter_clothing_skus')
        .update({ active })
        .eq('persona_id', personaId)
        .select('sku_id');
    await logAudit(session, {
        action: active ? 'starter_persona.activate' : 'starter_persona.deactivate',
        targetType: 'starter_persona',
        targetId: personaId,
        details: { affectedSkus: data?.length ?? 0 },
        ok: !error,
        error: error?.message,
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/control/starter');
    return { ok: true as const, affected: data?.length ?? 0 };
}
