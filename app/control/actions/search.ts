'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSession } from '../audit';

export type SearchHit = {
    type: 'user' | 'code' | 'payment' | 'waitlist' | 'contact';
    label: string;
    sub: string | null;
    href: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Escape LIKE / ILIKE metacharacters + PostgREST-filter-DSL delimiters.
 * PostgREST parses commas and dots inside `.or(...)` as predicate separators,
 * so interpolating raw user input into an .or() filter is an injection vector.
 * We avoid .or() entirely (see contacts branch), but we still escape here as
 * defense-in-depth for future callers.
 */
function escapeLikeAndDsl(s: string): string {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
}

/**
 * Global search hitting users, codes, payments, waitlist, contact messages.
 * Returns up to `limit` per category. Runs everything in parallel to keep
 * palette latency low.
 *
 * Security notes:
 *  - `q` is length-clamped to 100 chars before any query fires.
 *  - LIKE metacharacters (%, _, \) are escaped so a user query of `%` doesn't
 *    match every row.
 *  - We NEVER use `.or()` with interpolated input — every filter is a typed
 *    `.ilike(column, pattern)`.
 */
export async function searchAction(query: string, limit = 6): Promise<SearchHit[]> {
    await requireSession();
    const raw = query.trim().slice(0, 100);
    if (raw.length < 1) return [];
    const q = escapeLikeAndDsl(raw);
    const pat = `%${q}%`;

    const sb = supabaseAdmin();
    const isUuid = UUID_RE.test(raw);

    const [users, codes, payments, waitlist, contactsByEmail, contactsByName] = await Promise.all([
        // Users — search by full_name (fast, indexed via ilike). If q looks
        // like a UUID, also match on id.
        (async () => {
            const query = sb
                .from('profiles')
                .select('id, full_name, country, created_at')
                .limit(limit);
            const { data } = isUuid
                ? await query.eq('id', raw)
                : await query.ilike('full_name', pat);
            return (data ?? []).map((p): SearchHit => ({
                type: 'user',
                label: (p.full_name as string) || 'Unnamed user',
                sub: `${p.country ?? '—'} · joined ${new Date(p.created_at as string).toLocaleDateString()}`,
                href: `/control/users/${p.id}`,
            }));
        })(),

        // Promo codes — by code (uppercase match)
        (async () => {
            const { data } = await sb
                .from('promo_codes')
                .select('id, code, type, current_uses, max_uses, is_active')
                .ilike('code', pat)
                .limit(limit);
            return (data ?? []).map((c): SearchHit => ({
                type: 'code',
                label: c.code as string,
                sub: `${c.type} · ${c.current_uses}/${c.max_uses ?? '∞'} uses${c.is_active ? '' : ' · inactive'}`,
                href: `/control/promo-codes?q=${encodeURIComponent(c.code as string)}`,
            }));
        })(),

        // Payments — by provider_transaction_id
        (async () => {
            const { data } = await sb
                .from('payment_transactions')
                .select('id, provider, provider_transaction_id, amount, currency, status, user_id')
                .ilike('provider_transaction_id', pat)
                .limit(limit);
            return (data ?? []).map((p): SearchHit => ({
                type: 'payment',
                label: (p.provider_transaction_id as string) || 'no ref',
                sub: `${p.status} · ${(((p.amount as number) ?? 0) / 100).toFixed(2)} ${p.currency ?? ''} · ${p.provider}`,
                href: `/control/users/${p.user_id}`,
            }));
        })(),

        // Waitlist — by email (require 3+ chars so a lone '@' doesn't match everyone)
        (async () => {
            if (raw.length < 3) return [];
            const { data } = await sb
                .from('waitlist_emails')
                .select('id, email, name, created_at, invited_at')
                .ilike('email', pat)
                .limit(limit);
            return (data ?? []).map((w): SearchHit => ({
                type: 'waitlist',
                label: (w.email as string),
                sub: `${w.name ?? 'Anonymous'} · ${w.invited_at ? 'invited' : 'waiting'}`,
                href: `/control/waitlist`,
            }));
        })(),

        // Contact messages — by email (typed ilike, no .or() DSL injection surface).
        (async () => {
            if (raw.length < 2) return [];
            const { data } = await sb
                .from('contact_messages')
                .select('id, name, email, message, created_at')
                .ilike('email', pat)
                .limit(limit);
            return (data ?? []).map((c): SearchHit => ({
                type: 'contact',
                label: `${c.name ?? 'Anonymous'} · ${c.email}`,
                sub: ((c.message as string) ?? '').slice(0, 80),
                href: `/control/contact-messages`,
            }));
        })(),
        // Contact messages — by name (parallel to the email branch; merged + deduped below).
        (async () => {
            if (raw.length < 2) return [];
            const { data } = await sb
                .from('contact_messages')
                .select('id, name, email, message, created_at')
                .ilike('name', pat)
                .limit(limit);
            return (data ?? []).map((c): SearchHit => ({
                type: 'contact',
                label: `${c.name ?? 'Anonymous'} · ${c.email}`,
                sub: ((c.message as string) ?? '').slice(0, 80),
                href: `/control/contact-messages`,
            }));
        })(),
    ]);

    // Dedupe contact rows by (email + name) since a row can match both branches.
    const contactSeen = new Set<string>();
    const contacts = [...contactsByEmail, ...contactsByName].filter((c) => {
        if (contactSeen.has(c.label)) return false;
        contactSeen.add(c.label);
        return true;
    }).slice(0, limit);

    return [...users, ...codes, ...payments, ...waitlist, ...contacts];
}
