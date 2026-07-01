/**
 * Server-side Supabase client with the service-role key.
 * ONLY use inside control panel code — bypasses RLS.
 *
 * Never import this from a client component. The `import 'server-only'`
 * marker below enforces that at build time.
 */
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// We deliberately type the client with a permissive schema so callers can
// query any table without pulling in generated types. If we ever generate
// typed types via `supabase gen types typescript`, swap this for
// `Database` and every callsite gets end-to-end safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any;

let cached: SupabaseClient<AnyDatabase> | null = null;

export function supabaseAdmin(): SupabaseClient<AnyDatabase> {
    if (cached) return cached;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL missing');
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
    cached = createClient<AnyDatabase>(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    return cached;
}
