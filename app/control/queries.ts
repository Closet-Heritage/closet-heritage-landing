/**
 * All Supabase reads for the control panel. Server-only (uses the
 * service-role client — bypasses RLS). Keep this file as the single choke
 * point so every SQL query in the panel is auditable in one place.
 *
 * Design: every read returns `{ data, error }`-shaped values so failures
 * surface in the UI instead of silently coalescing to 0. A dead Supabase
 * or a permission problem must NEVER show as "0 pending things" — that's
 * exactly the failure mode a visibility panel is meant to prevent.
 */
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** Distinguishes "genuinely zero" from "we couldn't tell". */
export type Counted = { count: number | null; error: string | null };

function toCounted(res: { count: number | null; error: { message: string } | null }): Counted {
    return {
        count: res.error ? null : (res.count ?? 0),
        error: res.error ? res.error.message : null,
    };
}

// ── Dashboard stats ─────────────────────────────────────────────

export async function getDashboardStats() {
    const sb = supabaseAdmin();

    // Calendar-day windows (UTC-midnight aligned) — not rolling 24h.
    // Rolling windows made the "vs yesterday" comparison move constantly and
    // never showed a stable prior-day baseline.
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

    const [
        usersRes,
        signupsTodayRes,
        signupsWeekRes,
        dauTodayRes,
        dauYesterdayRes,
        totalItemsRes,
        totalOutfitsRes,
        activeSubsRes,
        trialSubsRes,
        starterSeededRes,
        // Neither `contact_messages` nor `comment_reports` has a `status`
        // column in production (as of 2026-07-01). Show total row counts;
        // the CEO/CTO reads context by scrolling into the tab. If we later
        // add `status`, filter here.
        totalContactRes,
        totalReportsRes,
    ] = await Promise.all([
        sb.from('profiles').select('*', { count: 'exact', head: true }),
        sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        // DAU today = seen on-or-after midnight UTC today
        sb.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', today.toISOString()),
        // DAU yesterday = seen between midnight-yesterday and midnight-today
        sb.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', yesterday.toISOString()).lt('last_active_at', today.toISOString()),
        sb.from('clothing_items').select('*', { count: 'exact', head: true }).eq('archived', false),
        sb.from('outfits').select('*', { count: 'exact', head: true }),
        sb.from('subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
        sb.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
        sb.from('profiles').select('*', { count: 'exact', head: true }).not('starter_persona_id', 'is', null),
        sb.from('contact_messages').select('*', { count: 'exact', head: true }),
        sb.from('comment_reports').select('*', { count: 'exact', head: true }),
    ]);

    const stats = {
        totalUsers: toCounted(usersRes),
        signupsToday: toCounted(signupsTodayRes),
        signupsThisWeek: toCounted(signupsWeekRes),
        dauToday: toCounted(dauTodayRes),
        dauYesterday: toCounted(dauYesterdayRes),
        totalItems: toCounted(totalItemsRes),
        totalOutfits: toCounted(totalOutfitsRes),
        activeSubs: toCounted(activeSubsRes),
        trialSubs: toCounted(trialSubsRes),
        starterSeeded: toCounted(starterSeededRes),
        contactMessages: toCounted(totalContactRes),
        commentReports: toCounted(totalReportsRes),
    };

    const errors: string[] = [];
    for (const [k, v] of Object.entries(stats)) {
        if (v.error) errors.push(`${k}: ${v.error}`);
    }

    return { stats, errors };
}

// ── Live feed sources ───────────────────────────────────────────

export async function getRecentSignups(limit = 15) {
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('profiles')
        .select('id, full_name, gender, country, starter_persona_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('[control] recentSignups:', error.message); return { data: [], error: error.message }; }
    return { data: data ?? [], error: null };
}

export async function getRecentSubscriptions(limit = 10) {
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('subscriptions')
        .select('id, user_id, plan, status, provider, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('[control] recentSubscriptions:', error.message); return { data: [], error: error.message }; }
    return { data: data ?? [], error: null };
}

export async function getRecentPayments(limit = 10) {
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('payment_transactions')
        .select('id, user_id, provider, amount, currency, status, plan, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('[control] recentPayments:', error.message); return { data: [], error: error.message }; }
    return { data: data ?? [], error: null };
}

// ── Users ───────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type UserRow = {
    id: string;
    email: string | null;
    full_name: string | null;
    gender: string | null;
    country: string | null;
    created_at: string;
    last_active_at: string | null;
    starter_persona_id: string | null;
    onboarded: boolean;
};

export async function getUsers(opts: { search?: string; page?: number; pageSize?: number } = {}): Promise<{ users: UserRow[]; total: number; error: string | null }> {
    const sb = supabaseAdmin();
    const page = Math.max(0, opts.page ?? 0);
    const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25));

    let profilesQuery = sb
        .from('profiles')
        .select('id, full_name, gender, country, created_at, last_active_at, starter_persona_id, has_completed_onboarding', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

    if (opts.search && opts.search.trim().length > 0) {
        // Name-only search — email lives in auth.users and isn't indexed for
        // ilike from the profiles side. The search box copy notes this.
        profilesQuery = profilesQuery.ilike('full_name', `%${opts.search.trim()}%`);
    }

    const { data: profiles, count, error } = await profilesQuery;
    if (error) { console.error('[control] getUsers:', error.message); return { users: [], total: 0, error: error.message }; }

    // Parallel auth-lookup instead of the previous N+1 serial. Still an
    // auth.admin call per row — fine for pageSize ≤ 25.
    const rows = await Promise.all((profiles ?? []).map(async (p) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: authRow } = await sb.auth.admin.getUserById(p.id as string).catch(() => ({ data: null } as any));
        return {
            id: p.id as string,
            email: authRow?.user?.email ?? null,
            full_name: (p.full_name as string | null) ?? null,
            gender: (p.gender as string | null) ?? null,
            country: (p.country as string | null) ?? null,
            created_at: p.created_at as string,
            last_active_at: (p.last_active_at as string | null) ?? null,
            starter_persona_id: (p.starter_persona_id as string | null) ?? null,
            onboarded: !!p.has_completed_onboarding,
        } satisfies UserRow;
    }));

    return { users: rows, total: count ?? 0, error: null };
}

export async function getUserById(id: string) {
    // Non-UUID id → treat as not found, don't blow up.
    if (!UUID_RE.test(id)) return null;

    const sb = supabaseAdmin();
    const [profileRes, authRes, wardrobeRes, outfitsRes, subsRes, paymentsRes, tryonUsageRes] = await Promise.all([
        sb.from('profiles').select('*').eq('id', id).maybeSingle(),
        sb.auth.admin.getUserById(id).catch(() => ({ data: null } as unknown as Awaited<ReturnType<typeof sb.auth.admin.getUserById>>)),
        sb.from('clothing_items').select('id, name, cropped_image_url, source, archived, created_at', { count: 'exact' }).eq('user_id', id).order('created_at', { ascending: false }).limit(20),
        sb.from('outfits').select('id, name, tryon_image_url, created_at', { count: 'exact' }).eq('user_id', id).order('created_at', { ascending: false }).limit(10),
        sb.from('subscriptions').select('*').eq('user_id', id).order('updated_at', { ascending: false }),
        sb.from('payment_transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
        sb.from('tryon_usage').select('*').eq('user_id', id).order('month_start', { ascending: false }).limit(3),
    ]);

    if (profileRes.error || !profileRes.data) {
        if (profileRes.error) console.error('[control] getUserById profile:', profileRes.error.message);
        return null;
    }

    return {
        profile: profileRes.data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (authRes as any)?.data?.user?.email ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emailConfirmedAt: (authRes as any)?.data?.user?.email_confirmed_at ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastSignInAt: (authRes as any)?.data?.user?.last_sign_in_at ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: (authRes as any)?.data?.user?.app_metadata?.provider ?? null,
        wardrobe: {
            items: wardrobeRes.data ?? [],
            total: wardrobeRes.count ?? 0,
        },
        outfits: {
            items: outfitsRes.data ?? [],
            total: outfitsRes.count ?? 0,
        },
        subscriptions: subsRes.data ?? [],
        payments: paymentsRes.data ?? [],
        tryonUsage: tryonUsageRes.data ?? [],
    };
}

// ── Contact messages ────────────────────────────────────────────

export async function getContactMessages(limit = 100) {
    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from('contact_messages')
        .select('id, name, email, message, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
}

// ── Reported comments ───────────────────────────────────────────

export async function getReportedComments(limit = 100) {
    const sb = supabaseAdmin();
    // Group by comment_id — we care about the comment + how many reports it
    // has, not each individual report row. Left-join the comment content.
    const { data, error } = await sb
        .from('comment_reports')
        .select('id, comment_id, reporter_user_id, reporter_fingerprint, reason, created_at, outfit_comments(id, user_id, author_name, content, is_hidden, shared_outfit_id, created_at)')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
}

// ── System health ───────────────────────────────────────────────

export async function getSystemHealth() {
    const sb = supabaseAdmin();
    const startedAt = Date.now();

    const [
        totalUsersRes,
        totalItemsRes,
        totalOutfitsRes,
        totalStarterSkusRes,
        activeStarterSkusRes,
        totalSharedRes,
        totalPaymentsRes,
    ] = await Promise.all([
        sb.from('profiles').select('*', { count: 'exact', head: true }),
        sb.from('clothing_items').select('*', { count: 'exact', head: true }),
        sb.from('outfits').select('*', { count: 'exact', head: true }),
        sb.from('starter_clothing_skus').select('*', { count: 'exact', head: true }),
        sb.from('starter_clothing_skus').select('*', { count: 'exact', head: true }).eq('active', true),
        sb.from('shared_outfits').select('*', { count: 'exact', head: true }),
        sb.from('payment_transactions').select('*', { count: 'exact', head: true }),
    ]);

    const supabaseLatencyMs = Date.now() - startedAt;

    const supabaseErrors: string[] = [];
    for (const [k, res] of [
        ['users', totalUsersRes], ['items', totalItemsRes], ['outfits', totalOutfitsRes],
        ['starterSkusTotal', totalStarterSkusRes], ['starterSkusActive', activeStarterSkusRes],
        ['sharedOutfits', totalSharedRes], ['payments', totalPaymentsRes],
    ] as const) {
        if (res.error) supabaseErrors.push(`${k}: ${res.error.message}`);
    }

    // Backend ping — non-fatal if it fails or is unset.
    let backendReachable: boolean | null = null;
    let backendLatencyMs: number | null = null;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (backendUrl) {
        // Strip any /api/v1 suffix — the health endpoint is at the root.
        const base = backendUrl.replace(/\/api\/v1\/?$/, '');
        const t0 = Date.now();
        try {
            const res = await fetch(`${base}/health`, {
                cache: 'no-store',
                signal: AbortSignal.timeout(4000),
            });
            backendReachable = res.ok;
            backendLatencyMs = Date.now() - t0;
        } catch {
            backendReachable = false;
            backendLatencyMs = Date.now() - t0;
        }
    }

    return {
        supabase: {
            reachable: supabaseErrors.length === 0,
            latencyMs: supabaseLatencyMs,
            errors: supabaseErrors,
            totalUsers: totalUsersRes.count ?? null,
            totalItems: totalItemsRes.count ?? null,
            totalOutfits: totalOutfitsRes.count ?? null,
            totalStarterSkus: totalStarterSkusRes.count ?? null,
            activeStarterSkus: activeStarterSkusRes.count ?? null,
            totalSharedOutfits: totalSharedRes.count ?? null,
            totalPayments: totalPaymentsRes.count ?? null,
        },
        backend: {
            configured: !!backendUrl,
            url: backendUrl ?? null,
            reachable: backendReachable,
            latencyMs: backendLatencyMs,
        },
        env: {
            SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            CONTROL_PASSWORD: !!process.env.CONTROL_PASSWORD,
            CONTROL_SIGNING_KEY: !!process.env.CONTROL_SIGNING_KEY,
            BACKEND_URL: !!backendUrl,
        },
    };
}
