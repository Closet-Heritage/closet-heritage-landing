import 'server-only';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** Rough per-photo AI cost (Gemini validation + grid + tag + verify + BG rem). */
const COST_PER_PHOTO_USD = 0.09;
/** Rough per try-on AI cost (Gemini 3 Pro image or Flash fallback). */
const COST_PER_TRYON_USD = 0.12;

export type BatchRow = {
    id: string;
    user_id: string;
    total_photos: number;
    photos_processed: number;
    items_detected: number;
    status: string;
    error_message: string | null;
    created_at: string;
    completed_at: string | null;
    processing_time_ms: number | null;
};

export async function getBatches(opts: { status?: string; limit?: number } = {}) {
    const sb = supabaseAdmin();
    let q = sb
        .from('upload_batches')
        .select('id, user_id, total_photos, photos_processed, items_detected, status, error_message, created_at, completed_at, processing_time_ms', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(opts.limit ?? 100);
    if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status);
    const { data, count, error } = await q;
    if (error) return { rows: [] as BatchRow[], total: 0, error: error.message };
    return { rows: (data ?? []) as unknown as BatchRow[], total: count ?? 0, error: null };
}

export async function getAIStats() {
    const sb = supabaseAdmin();
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);

    const [
        totalBatchesRes,
        failedTodayRes,
        processingRes,
        photosThisMonthRes,
        tryonRowsRes,
    ] = await Promise.all([
        sb.from('upload_batches').select('*', { count: 'exact', head: true }),
        sb.from('upload_batches').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', dayStart.toISOString()),
        sb.from('upload_batches').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        // photo_uploads is per-photo; count where batch is in this month.
        sb.from('photo_uploads').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
        sb.from('tryon_usage').select('count, month_start').gte('month_start', monthStart.toISOString().slice(0, 10)),
    ]);

    const tryonThisMonth = (tryonRowsRes.data ?? []).reduce((sum: number, r) => sum + ((r.count as number) ?? 0), 0);
    const photosThisMonth = photosThisMonthRes.count ?? 0;

    return {
        totalBatches: totalBatchesRes.count ?? null,
        failedToday: failedTodayRes.count ?? null,
        processing: processingRes.count ?? null,
        photosThisMonth,
        tryonThisMonth,
        estCostThisMonthUsd: photosThisMonth * COST_PER_PHOTO_USD + tryonThisMonth * COST_PER_TRYON_USD,
        estCostPhotoUsd: COST_PER_PHOTO_USD,
        estCostTryonUsd: COST_PER_TRYON_USD,
    };
}
