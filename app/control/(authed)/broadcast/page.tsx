export const dynamic = 'force-dynamic';

import { Radio } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { BroadcastForm } from './form';

async function getBroadcastStats() {
    const sb = supabaseAdmin();
    const { count: tokensCount } = await sb.from('user_push_tokens').select('*', { count: 'exact', head: true });
    return { tokens: tokensCount ?? 0 };
}

export default async function BroadcastPage() {
    const stats = await getBroadcastStats();

    return (
        <div className="max-w-[720px] space-y-5">
            <header className="flex items-center gap-3">
                <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--ch-accent-tint)', color: 'var(--ch-accent-dark)' }}
                >
                    <Radio className="w-5 h-5" />
                </span>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Broadcast push</h1>
                    <p className="text-sm ch-soft mt-0.5">
                        Fire a push notification to every device. Use dry-run first.
                    </p>
                </div>
            </header>

            <div className="ch-card p-4 flex items-center gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider ch-muted">Registered devices</p>
                    <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--ch-fg)' }}>{stats.tokens.toLocaleString()}</p>
                </div>
                <p className="text-xs ch-soft ml-auto max-w-[280px]">
                    One user may have multiple devices. Use <span className="ch-kbd">Dry run</span> first to see the exact count before firing.
                </p>
            </div>

            <BroadcastForm />

            <div className="ch-card p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider ch-muted mb-2">Delivery notes</p>
                <ul className="space-y-1.5 text-[12.5px] ch-soft">
                    <li>• Uses Expo's push endpoint. Devices that migrated away from Expo or revoked notification permission silently drop.</li>
                    <li>• Rich content (image, deep link) is limited by iOS/Android push payload size.</li>
                    <li>• The deep-link URL is passed as <span className="ch-kbd">data.url</span> — the mobile app handles it in <span className="ch-kbd">usePushNotifications.ts</span>.</li>
                    <li>• Every broadcast is audited with token count, Expo's response summary, and any errors.</li>
                </ul>
            </div>
        </div>
    );
}
