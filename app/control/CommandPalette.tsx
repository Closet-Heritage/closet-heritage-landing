'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Ticket, CreditCard, UserPlus, Mail, ArrowRight, Command } from 'lucide-react';
import { searchAction, type SearchHit } from './actions/search';

const ICON_FOR: Record<SearchHit['type'], typeof Search> = {
    user: User,
    code: Ticket,
    payment: CreditCard,
    waitlist: UserPlus,
    contact: Mail,
};

const TYPE_LABEL: Record<SearchHit['type'], string> = {
    user: 'Users',
    code: 'Promo codes',
    payment: 'Payments',
    waitlist: 'Waitlist',
    contact: 'Contact',
};

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchHit[]>([]);
    const [selected, setSelected] = useState(0);
    const [pending, startTransition] = useTransition();
    const [searchError, setSearchError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const restoreFocusRef = useRef<HTMLElement | null>(null);
    // Bump on every dispatch so a slow response from an old query can't
    // overwrite results from a newer one.
    const latestQueryRef = useRef(0);

    // ⌘K / Ctrl+K to open. Escape only closes when open. Editable targets
    // (input/textarea/contenteditable) still get to open the palette — it's
    // a global admin shortcut and hijacking there is fine, but they should
    // NOT block editing on Enter etc. once inside a field.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Use e.code (physical key) so alternate keyboard layouts still
            // resolve to 'KeyK'. Skip repeat events.
            if (e.repeat) return;
            if ((e.metaKey || e.ctrlKey) && e.code === 'KeyK') {
                e.preventDefault();
                setOpen((o) => !o);
                return;
            }
            if (e.key === 'Escape' && open) {
                e.preventDefault();
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    // Focus input on open, restore prior focus on close.
    useEffect(() => {
        if (open) {
            restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setTimeout(() => inputRef.current?.focus(), 20);
            return;
        }
        setQuery('');
        setResults([]);
        setSelected(0);
        setSearchError(null);
        // Restore focus so screen readers announce return.
        setTimeout(() => restoreFocusRef.current?.focus?.(), 0);
    }, [open]);

    // Debounced query. Race-safe: each dispatch tags itself with a sequence
    // number; only the most recent response is allowed to update state.
    useEffect(() => {
        if (!open) return;
        if (query.trim().length === 0) { setResults([]); setSearchError(null); return; }
        const seq = ++latestQueryRef.current;
        const t = setTimeout(() => {
            startTransition(async () => {
                try {
                    const hits = await searchAction(query, 5);
                    if (seq !== latestQueryRef.current) return; // stale
                    setResults(hits);
                    setSelected(0);
                    setSearchError(null);
                } catch (err) {
                    if (seq !== latestQueryRef.current) return; // stale
                    setResults([]);
                    const msg = err instanceof Error ? err.message : String(err);
                    setSearchError(msg);
                }
            });
        }, 180);
        return () => clearTimeout(t);
    }, [query, open]);

    // Focus trap — Tab / Shift-Tab wrap inside the dialog.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const root = dialogRef.current;
            if (!root) return;
            const focusables = root.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const pick = (hit: SearchHit) => {
        setOpen(false);
        router.push(hit.href);
    };

    const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, Math.max(0, results.length - 1))); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(0, s - 1)); }
        if (e.key === 'Enter' && results[selected]) { e.preventDefault(); pick(results[selected]); }
    };

    return (
        <>
            {/* Desktop trigger — visible ≥ md. Mobile users open via the drawer button below. */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="hidden md:inline-flex items-center gap-2 rounded-lg text-[12.5px] transition-colors"
                style={{
                    padding: '5px 10px',
                    background: 'var(--ch-cream)',
                    color: 'var(--ch-fg-3)',
                    border: '1px solid var(--ch-border)',
                    minWidth: 220,
                }}
                title="Search — ⌘K"
                aria-label="Open search palette (⌘K)"
            >
                <Search className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">Search users, codes, payments…</span>
                <span className="ch-kbd inline-flex items-center gap-0.5 text-[10.5px] px-1 py-0" style={{ background: '#FFFFFF' }}>
                    <Command className="w-2.5 h-2.5" />K
                </span>
            </button>

            {/* Mobile trigger — icon-only, part of the top bar so the palette is reachable on phones. */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="md:hidden inline-flex items-center justify-center rounded-lg"
                style={{
                    width: 32, height: 32,
                    background: 'var(--ch-cream)',
                    color: 'var(--ch-fg-2)',
                    border: '1px solid var(--ch-border)',
                }}
                title="Search"
                aria-label="Open search"
            >
                <Search className="w-4 h-4" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
                    style={{ background: 'rgba(41, 26, 12, 0.45)' }}
                    onClick={() => setOpen(false)}
                    aria-hidden="false"
                >
                    <div
                        ref={dialogRef}
                        className="ch-card w-full max-w-xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cmd-k-title"
                    >
                        <h2 id="cmd-k-title" className="sr-only">Search users, codes, payments</h2>
                        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--ch-border)' }}>
                            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--ch-fg-3)' }} />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onInputKey}
                                placeholder="Search users by name, code, transaction ID, email…"
                                className="flex-1 bg-transparent outline-none text-[15px]"
                                style={{ color: 'var(--ch-fg)' }}
                                maxLength={100}
                                aria-label="Search query"
                            />
                            {pending && <span className="ch-pill ch-pill--gold">…</span>}
                            <button
                                onClick={() => setOpen(false)}
                                className="text-[11px] ch-muted hover:text-[var(--ch-fg-2)]"
                                title="Close"
                            >
                                esc
                            </button>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto">
                            {searchError && (
                                <div
                                    className="px-4 py-3 text-[12.5px]"
                                    style={{ background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)', borderBottom: '1px solid var(--ch-border)' }}
                                >
                                    Search failed: <span className="font-mono">{searchError}</span>
                                    {searchError.toLowerCase().includes('unauthorized') && (
                                        <button
                                            onClick={() => { setOpen(false); router.push('/control/login'); }}
                                            className="ml-3 underline"
                                        >
                                            Sign in
                                        </button>
                                    )}
                                </div>
                            )}
                            {query.length === 0 && !searchError && (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm ch-soft">Start typing to search everywhere.</p>
                                    <p className="text-[11px] ch-muted mt-2">
                                        Try a name, an email, a code, or a Paystack reference.
                                    </p>
                                </div>
                            )}
                            {query.length > 0 && results.length === 0 && !pending && !searchError && (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm ch-soft">No matches for <span className="ch-kbd">{query}</span>.</p>
                                </div>
                            )}
                            {results.length > 0 && (
                                <ul className="py-1" role="listbox">
                                    {results.map((hit, i) => {
                                        const Icon = ICON_FOR[hit.type];
                                        const active = i === selected;
                                        return (
                                            <li key={`${hit.type}-${hit.href}-${i}`}>
                                                <button
                                                    onClick={() => pick(hit)}
                                                    role="option"
                                                    aria-selected={active}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                                                    style={{
                                                        background: active ? 'var(--ch-accent-tint)' : 'transparent',
                                                    }}
                                                >
                                                    <span
                                                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                        style={{
                                                            background: active ? '#FFFFFF' : 'var(--ch-cream)',
                                                            color: 'var(--ch-accent-dark)',
                                                        }}
                                                    >
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13.5px] font-medium truncate" style={{ color: 'var(--ch-fg)' }}>
                                                            {hit.label}
                                                        </p>
                                                        {hit.sub && (
                                                            <p className="text-[11.5px] truncate ch-muted">{hit.sub}</p>
                                                        )}
                                                    </div>
                                                    <span className="ch-pill ch-pill--muted shrink-0">{TYPE_LABEL[hit.type]}</span>
                                                    <ArrowRight
                                                        className="w-3.5 h-3.5 shrink-0 transition-opacity"
                                                        style={{ color: 'var(--ch-fg-3)', opacity: active ? 1 : 0 }}
                                                    />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div
                            className="px-4 py-2 flex items-center gap-3 text-[10.5px] ch-muted"
                            style={{ borderTop: '1px solid var(--ch-border)', background: 'var(--ch-cream)' }}
                        >
                            <span className="ch-kbd">↑↓</span> navigate
                            <span className="ch-kbd">↵</span> open
                            <span className="ch-kbd">esc</span> close
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // isEditableTarget is currently unused because we deliberately let ⌘K fire
    // in editable contexts (globally-scoped admin shortcut). Kept exported-ish
    // via reference to satisfy future contributors — the intent is documented.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function _keepIsEditable() { return isEditableTarget; }
}
