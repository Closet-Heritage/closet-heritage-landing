'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    Terminal,
    BookOpen,
    LogOut,
    Menu,
    Mail,
    Flag,
    Ticket,
    CreditCard,
    UserPlus,
    ScrollText,
    Cpu,
    Radio,
    Sparkles,
} from 'lucide-react';
import { logoutAction } from './auth';
import type { ControlRole } from '@/lib/control-auth';
import { CommandPalette } from './CommandPalette';

type NavLink = { label: string; href: string; icon: typeof LayoutDashboard; exact?: boolean; roles?: ControlRole[] };
type NavItem = NavLink | { section: string };

const NAV_ITEMS: NavItem[] = [
    { section: 'Overview' },
    { label: 'Dashboard', href: '/control', icon: LayoutDashboard, exact: true },

    { section: 'People' },
    { label: 'Users', href: '/control/users', icon: Users },
    { label: 'Waitlist', href: '/control/waitlist', icon: UserPlus },

    { section: 'Growth' },
    { label: 'Promo codes', href: '/control/promo-codes', icon: Ticket },
    { label: 'Payments', href: '/control/payments', icon: CreditCard },
    { label: 'Broadcast', href: '/control/broadcast', icon: Radio },

    { section: 'Product' },
    { label: 'Starter wardrobe', href: '/control/starter', icon: Sparkles },
    { label: 'AI ops', href: '/control/ai-ops', icon: Cpu },

    { section: 'Inbox' },
    { label: 'Contact', href: '/control/contact-messages', icon: Mail },
    { label: 'Reports', href: '/control/reports', icon: Flag },

    { section: 'Reference' },
    { label: 'Docs', href: '/control/docs', icon: BookOpen },
    { label: 'Audit log', href: '/control/audit', icon: ScrollText },
    { label: 'System', href: '/control/system', icon: Settings },
];

function cn(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

function isLink(item: NavItem): item is NavLink {
    return 'href' in item;
}

function visibleNav(role: ControlRole): NavItem[] {
    const kept = NAV_ITEMS.filter(item => isLink(item) ? (!item.roles || item.roles.includes(role)) : true);
    return kept.filter((item, idx) => isLink(item) || isLink(kept[idx + 1] ?? { section: '' }));
}

function getBreadcrumb(pathname: string): string {
    const match = NAV_ITEMS.filter(isLink).find(item =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href)
    );
    if (!match) return 'Control Panel';
    const segments = pathname.replace(match.href, '').split('/').filter(Boolean);
    return segments.length > 0 ? `${match.label} · Detail` : match.label;
}

export default function ControlShell({
    name,
    role,
    children,
}: {
    name: string;
    role: ControlRole;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const breadcrumb = getBreadcrumb(pathname);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const navItems = visibleNav(role);
    const firstName = name.trim().split(/\s+/)[0] || 'there';

    const sidebarContent = (
        <>
            <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--ch-sidebar-border)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C4956A] flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-[#1A0F08]" />
                    </div>
                    <div>
                        <p className="text-[#F5E9DD] text-sm font-semibold tracking-tight">Closet Heritage</p>
                        <p className="text-[#C4B3A0]/60 text-[10px] font-medium tracking-widest uppercase">Control</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {navItems.map((item, i) => {
                    if ('section' in item) {
                        return (
                            <p
                                key={item.section}
                                className={cn('text-[9px] font-bold tracking-[0.2em] uppercase text-[#C4B3A0]/70 px-3 mb-1', i > 0 && 'mt-4')}
                            >
                                {item.section}
                            </p>
                        );
                    }
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-0.5',
                                isActive
                                    ? 'text-[#C4956A] border-l-2 border-[#C4956A]'
                                    : 'text-[#C4B3A0]/70 hover:text-[#F5E9DD] border-l-2 border-transparent'
                            )}
                            style={{
                                background: isActive ? 'rgba(196, 149, 106, 0.10)' : 'transparent',
                            }}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--ch-sidebar-border)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[#F5E9DD]/85 text-[11px] font-medium">Hi {firstName}</p>
                        <p className="text-[#C4B3A0]/50 text-[10px] capitalize">{role}</p>
                    </div>
                    <button
                        onClick={async () => { await logoutAction(); router.push('/control/login'); }}
                        className="p-1.5 rounded-lg text-[#C4B3A0]/45 hover:text-[#F5E9DD]/80 transition-colors"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 233, 221, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        title="Sign out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ch-cream)' }}>
            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex w-[220px] flex-col shrink-0"
                style={{ background: 'var(--ch-sidebar-bg)' }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile drawer */}
            <div
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
                className={cn(
                    'lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
                    mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            />
            <aside
                className={cn(
                    'lg:hidden fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col transition-transform duration-300 ease-out',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
                style={{ background: 'var(--ch-sidebar-bg)' }}
            >
                {sidebarContent}
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 ch-panel">
                <header
                    className="h-12 flex items-center gap-2 px-4 sm:px-6 shrink-0"
                    style={{ background: '#FFFFFF', borderBottom: '1px solid var(--ch-border)' }}
                >
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden -ml-1 p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--ch-fg-2)' }}
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--ch-fg)' }}>
                        {breadcrumb}
                    </h1>
                    <div className="ml-auto">
                        <CommandPalette />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
