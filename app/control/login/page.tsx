'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Terminal, Lock, ArrowRight } from 'lucide-react';
import { loginAction } from '../auth';

/**
 * useSearchParams triggers a Next 16 build error when the reading component
 * is not wrapped in a Suspense boundary — the build stops with
 * "useSearchParams should be wrapped in a suspense boundary at page /control/login".
 * We split into a small inner component so the outer default export can wrap
 * it in <Suspense>. Behavior is unchanged.
 */
export default function ControlLoginPage() {
    return (
        <Suspense fallback={<Shell><FormSkeleton /></Shell>}>
            <ControlLoginInner />
        </Suspense>
    );
}

function ControlLoginInner() {
    const router = useRouter();
    const params = useSearchParams();
    // Only accept same-origin absolute paths. Parse via WHATWG URL so we
    // catch tab/CR/LF exploits — the URL parser strips those characters
    // before parsing, so `/\t/evil.com` normalizes to `//evil.com` and
    // resolves cross-origin. Comparing the parsed origin is strictly
    // stronger than string-prefix checks. Falls back to /control on any
    // malformed input.
    let next = '/control';
    if (typeof window !== 'undefined') {
        const raw = params.get('next') || '';
        if (raw && raw.startsWith('/') && !/[\t\r\n]/.test(raw)) {
            try {
                const candidate = new URL(raw, window.location.origin);
                if (candidate.origin === window.location.origin) {
                    next = candidate.pathname + candidate.search + candidate.hash;
                }
            } catch {
                // malformed → keep default
            }
        }
    }
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    return (
        <Shell>
            <form
                action={(fd) => {
                    setError(null);
                    startTransition(async () => {
                        const res = await loginAction(fd);
                        if (!res.ok) {
                            setError(res.error);
                            return;
                        }
                        router.replace(next);
                        router.refresh();
                    });
                }}
                className="space-y-4 rounded-2xl p-6 shadow-2xl"
                style={{ background: '#FFFFFF', border: '1px solid var(--ch-border)' }}
            >
                <div>
                    <label className="ch-label">Your name</label>
                    <input
                        name="name"
                        required
                        placeholder="Ryan"
                        className="ch-input"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="ch-label">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ch-fg-3)' }} />
                        <input
                            name="password"
                            type="password"
                            required
                            className="ch-input pl-9"
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-xs font-medium" style={{ color: 'var(--ch-danger)' }}>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="ch-btn ch-btn--primary w-full"
                >
                    {pending ? 'Signing in…' : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
                </button>
            </form>

            <p className="text-[11px] text-center mt-6" style={{ color: 'var(--ch-sidebar-fg-muted)' }}>
                Password lives in the <code style={{ color: 'var(--ch-sidebar-fg)' }}>CONTROL_PASSWORD</code> env var.
                Role is assigned server-side by name.
            </p>
        </Shell>
    );
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--ch-sidebar-bg)' }}>
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--ch-accent)' }}>
                        <Terminal className="w-5 h-5" style={{ color: 'var(--ch-sidebar-bg)' }} />
                    </div>
                    <div>
                        <p className="text-base font-semibold tracking-tight" style={{ color: 'var(--ch-sidebar-fg)' }}>Closet Heritage</p>
                        <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--ch-sidebar-fg-muted)' }}>Control</p>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}

function FormSkeleton() {
    return (
        <div className="rounded-2xl p-6 shadow-2xl space-y-4" style={{ background: '#FFFFFF', border: '1px solid var(--ch-border)' }}>
            <div className="h-9 rounded-lg animate-pulse" style={{ background: 'var(--ch-cream)' }} />
            <div className="h-9 rounded-lg animate-pulse" style={{ background: 'var(--ch-cream)' }} />
            <div className="h-9 rounded-lg animate-pulse" style={{ background: 'var(--ch-cream)' }} />
        </div>
    );
}
