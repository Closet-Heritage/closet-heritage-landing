export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Search, User as UserIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { getUsers } from '../../queries';

type SP = Promise<{ q?: string; page?: string }>;

function relative(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default async function UsersPage({ searchParams }: { searchParams: SP }) {
    const params = await searchParams;
    const q = params.q ?? '';
    const page = Math.max(0, parseInt(params.page ?? '0', 10) || 0);
    const pageSize = 25;

    const { users, total, error } = await getUsers({ search: q, page, pageSize });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    // If someone typed an email address, tell them the search is name-only —
    // don't leave them thinking "no results" means "nobody with that address".
    const isEmailLikeQuery = q.includes('@');

    return (
        <div className="max-w-[1200px] space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Users</h1>
                <p className="text-sm ch-soft mt-1">
                    {total.toLocaleString()} total {q && `· matching "${q}"`}
                </p>
            </div>

            <form method="get" className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ch-fg-3)' }} />
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search by name (not email)…"
                        className="ch-input pl-9"
                    />
                </div>
                <button type="submit" className="ch-btn ch-btn--primary">Search</button>
                {q && (
                    <Link href="/control/users" className="ch-btn ch-btn--secondary">Clear</Link>
                )}
            </form>

            {isEmailLikeQuery && (
                <div className="rounded-lg px-3.5 py-2.5 text-[12.5px]" style={{ background: 'var(--ch-warn-tint)', border: '1px solid rgba(180, 104, 10, 0.25)', color: 'var(--ch-warn)' }}>
                    Search matches display names only — email lookup isn&apos;t supported here. Try just the person&apos;s first or last name.
                </div>
            )}
            {error && (
                <div className="rounded-lg px-3.5 py-2.5 text-[12.5px]" style={{ background: 'var(--ch-danger-tint)', border: '1px solid var(--ch-danger)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            <div className="ch-card overflow-hidden">
                {users.length === 0 ? (
                    <div className="py-16 text-center">
                        <UserIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm ch-muted">No users found.</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--ch-border)' }}>
                        {users.map(u => {
                            const initials = (u.full_name ?? u.email ?? '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
                            return (
                                <Link
                                    key={u.id}
                                    href={`/control/users/${u.id}`}
                                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--ch-accent-tint)]"
                                >
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                        style={{ background: 'var(--ch-accent-tint)', color: 'var(--ch-accent-dark)' }}
                                    >
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ch-fg)' }}>{u.full_name || 'Unnamed'}</p>
                                            {u.onboarded && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ch-success)' }} />}
                                            {u.starter_persona_id && (
                                                <span className="ch-pill ch-pill--gold">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    Starter
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs ch-muted truncate">
                                            {u.email ?? 'no email'} · {u.gender ?? '—'} · {u.country ?? '—'}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[11px] ch-muted">joined</p>
                                        <p className="text-xs font-medium tabular-nums" style={{ color: 'var(--ch-fg-2)' }}>{relative(u.created_at)}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs ch-muted">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {page > 0 && (
                            <Link
                                href={`/control/users?${new URLSearchParams({ q, page: String(page - 1) }).toString()}`}
                                className="ch-btn ch-btn--secondary !text-[11px]"
                            >
                                ← Prev
                            </Link>
                        )}
                        {page + 1 < totalPages && (
                            <Link
                                href={`/control/users?${new URLSearchParams({ q, page: String(page + 1) }).toString()}`}
                                className="ch-btn ch-btn--primary !text-[11px]"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
