'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOCS_TOC } from '../../docs-config';

export default function DocsSidebar() {
    const pathname = usePathname();
    const active = pathname;

    return (
        <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-4 lg:self-start">
            <nav
                className="rounded-2xl p-3 max-h-[calc(100vh-6rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ background: '#FFFFFF', border: '1px solid var(--ch-border)' }}
            >
                {DOCS_TOC.map(section => (
                    <div key={section.id} className="mb-4 last:mb-0">
                        <p
                            className="text-[10px] font-bold tracking-[0.16em] uppercase px-2 mb-1.5"
                            style={{ color: 'var(--ch-fg-3)' }}
                        >
                            {section.title}
                        </p>
                        <div>
                            {section.docs.map(doc => {
                                const href = `/control/docs/${section.id}/${doc.slug}`;
                                const isActive = active === href;
                                return (
                                    <Link
                                        key={doc.slug}
                                        href={href}
                                        className="block px-2 py-1.5 rounded-md text-[12.5px] transition-colors"
                                        style={{
                                            background: isActive ? 'var(--ch-accent-tint)' : 'transparent',
                                            color: isActive ? 'var(--ch-accent-dark)' : 'var(--ch-fg-2)',
                                            fontWeight: isActive ? 600 : 400,
                                        }}
                                    >
                                        {doc.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
