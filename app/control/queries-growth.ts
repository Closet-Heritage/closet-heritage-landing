/**
 * Growth-page queries — promo codes, waitlist, ambassadors.
 * Split out of queries.ts to keep that file's scope legible (dashboard +
 * users + system). Same rules: server-only, service-role, single choke point.
 */
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ── Promo codes ─────────────────────────────────────────────────

export type PromoCodeRow = {
    id: string;
    code: string;
    type: 'referral' | 'ambassador' | 'gift' | 'promo';
    owner_id: string | null;
    owner_name: string | null;
    coins_referrer: number;
    coins_redeemer: number;
    gift_plan: string | null;
    gift_duration: string | null;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    // computed:
    total_redemptions: number;
    referrer_rewards_paid: number;
};

export async function getPromoCodes(opts: { search?: string; type?: string } = {}): Promise<{
    codes: PromoCodeRow[];
    error: string | null;
}> {
    const sb = supabaseAdmin();
    let q = sb
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (opts.search?.trim()) {
        q = q.ilike('code', `%${opts.search.trim()}%`);
    }
    if (opts.type && opts.type !== 'all') {
        q = q.eq('type', opts.type);
    }

    const { data: codes, error } = await q;
    if (error) return { codes: [], error: error.message };

    // For each code, count redemptions + referrer rewards. Two batched queries
    // to avoid N+1 per code.
    const ids = (codes ?? []).map((c) => c.id as string);
    if (ids.length === 0) return { codes: [], error: null };

    const { data: allRedemptions } = await sb
        .from('code_redemptions')
        .select('code_id, referrer_rewarded')
        .in('code_id', ids);

    const totals = new Map<string, { total: number; paid: number }>();
    for (const r of allRedemptions ?? []) {
        const cur = totals.get(r.code_id as string) ?? { total: 0, paid: 0 };
        cur.total += 1;
        if (r.referrer_rewarded) cur.paid += 1;
        totals.set(r.code_id as string, cur);
    }

    // Look up owner names in a batch.
    const ownerIds = Array.from(new Set((codes ?? []).map((c) => c.owner_id).filter((x): x is string => !!x)));
    const ownerNames = new Map<string, string>();
    if (ownerIds.length > 0) {
        const { data: owners } = await sb.from('profiles').select('id, full_name').in('id', ownerIds);
        for (const o of owners ?? []) {
            ownerNames.set(o.id as string, (o.full_name as string) ?? '');
        }
    }

    const rows: PromoCodeRow[] = (codes ?? []).map((c) => {
        const t = totals.get(c.id as string) ?? { total: 0, paid: 0 };
        return {
            id: c.id as string,
            code: c.code as string,
            type: c.type as PromoCodeRow['type'],
            owner_id: (c.owner_id as string | null) ?? null,
            owner_name: c.owner_id ? (ownerNames.get(c.owner_id as string) ?? null) : null,
            coins_referrer: (c.coins_referrer as number) ?? 0,
            coins_redeemer: (c.coins_redeemer as number) ?? 0,
            gift_plan: (c.gift_plan as string | null) ?? null,
            gift_duration: (c.gift_duration as string | null) ?? null,
            max_uses: (c.max_uses as number | null) ?? null,
            current_uses: (c.current_uses as number) ?? 0,
            is_active: !!c.is_active,
            expires_at: (c.expires_at as string | null) ?? null,
            created_at: c.created_at as string,
            total_redemptions: t.total,
            referrer_rewards_paid: t.paid,
        };
    });

    return { codes: rows, error: null };
}

export async function getPromoCodeStats() {
    const sb = supabaseAdmin();
    const [totalRes, activeRes, redemptionsRes] = await Promise.all([
        sb.from('promo_codes').select('*', { count: 'exact', head: true }),
        sb.from('promo_codes').select('*', { count: 'exact', head: true }).eq('is_active', true),
        sb.from('code_redemptions').select('*', { count: 'exact', head: true }),
    ]);
    return {
        total: totalRes.count ?? null,
        active: activeRes.count ?? null,
        redemptions: redemptionsRes.count ?? null,
    };
}

// ── Waitlist ─────────────────────────────────────────────────────

export async function getWaitlist(limit = 500): Promise<{ rows: Array<{ id: string; email: string; name: string | null; created_at: string; invited_at: string | null }>; error: string | null }> {
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('waitlist_emails')
        .select('id, email, name, created_at, invited_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) return { rows: [], error: error.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { rows: (data ?? []) as any[], error: null };
}

export async function getWaitlistStats() {
    const sb = supabaseAdmin();
    const [totalRes, invitedRes] = await Promise.all([
        sb.from('waitlist_emails').select('*', { count: 'exact', head: true }),
        sb.from('waitlist_emails').select('*', { count: 'exact', head: true }).not('invited_at', 'is', null),
    ]);
    return {
        total: totalRes.count ?? null,
        invited: invitedRes.count ?? null,
        uninvited: (totalRes.count ?? 0) - (invitedRes.count ?? 0),
    };
}

// ── Payments ─────────────────────────────────────────────────────

export async function getPayments(opts: { status?: string; provider?: string; limit?: number } = {}) {
    const sb = supabaseAdmin();
    let q = sb
        .from('payment_transactions')
        .select('id, user_id, provider, provider_transaction_id, amount, currency, status, plan, period_type, created_at, metadata', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(opts.limit ?? 100);
    if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status);
    if (opts.provider && opts.provider !== 'all') q = q.eq('provider', opts.provider);
    const { data, count, error } = await q;
    if (error) return { rows: [], total: 0, error: error.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { rows: (data ?? []) as any[], total: count ?? 0, error: null };
}

export async function getPaymentStats() {
    const sb = supabaseAdmin();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [totalRes, succeededTodayRes, failedTodayRes, processingRes, refundedRes] = await Promise.all([
        sb.from('payment_transactions').select('*', { count: 'exact', head: true }),
        // Backend writes 'success' (not 'succeeded') — enum verified against
        // production. Do NOT rename either side without cross-checking
        // ch-backend-main/src/routes/webhook.routes.ts + payment.routes.ts.
        sb.from('payment_transactions').select('*', { count: 'exact', head: true }).eq('status', 'success').gte('created_at', today.toISOString()),
        sb.from('payment_transactions').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', today.toISOString()),
        sb.from('payment_transactions').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        sb.from('payment_transactions').select('*', { count: 'exact', head: true }).eq('status', 'refunded'),
    ]);
    return {
        total: totalRes.count ?? null,
        succeededToday: succeededTodayRes.count ?? null,
        failedToday: failedTodayRes.count ?? null,
        processing: processingRes.count ?? null,
        refunded: refundedRes.count ?? null,
    };
}
