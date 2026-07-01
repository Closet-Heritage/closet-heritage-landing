export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { findDoc, flatDocs } from '../../../../docs-config';
import { loadDoc } from '../../../../docs-loader';

type PP = Promise<{ section: string; slug: string }>;

export default async function DocPage({ params }: { params: PP }) {
    const { section, slug } = await params;
    const meta = findDoc(section, slug);
    if (!meta) notFound();

    const loaded = await loadDoc(section, slug);
    if (!loaded || loaded.isEmpty) {
        return (
            <div className="max-w-[820px]">
                <BreadcrumbNav sectionTitle={meta.section.title} title={meta.doc.title} />
                <h1 className="text-3xl font-bold tracking-tight mt-3 mb-3" style={{ color: 'var(--ch-fg)' }}>{meta.doc.title}</h1>
                <div
                    className="rounded-2xl p-5"
                    style={{ border: '1px solid var(--ch-warn)', background: 'var(--ch-warn-tint)' }}
                >
                    <p className="text-sm font-medium" style={{ color: 'var(--ch-warn)' }}>
                        This doc has not been written yet.
                    </p>
                    <p className="text-xs mt-2 font-mono" style={{ color: 'var(--ch-warn)', opacity: 0.75 }}>
                        Expected at: content/docs/{section}/{slug}.md
                    </p>
                </div>
            </div>
        );
    }

    // Prev / Next nav across the whole doc list.
    const flat = flatDocs();
    const idx = flat.findIndex(d => d.sectionId === section && d.slug === slug);
    const prev = idx > 0 ? flat[idx - 1] : null;
    const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

    const frontTitle = (loaded.frontmatter.title as string) || meta.doc.title;
    const frontSub = loaded.frontmatter.sub as string | undefined;

    return (
        <article className="max-w-[820px]">
            <BreadcrumbNav sectionTitle={meta.section.title} title={frontTitle} />
            <header
                className="mt-3 mb-6 pb-6"
                style={{ borderBottom: '1px solid var(--ch-border)' }}
            >
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>{frontTitle}</h1>
                {frontSub && <p className="text-base mt-2 ch-soft">{frontSub}</p>}
            </header>

            <div
                className="docs-prose"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: loaded.html }}
            />

            <nav
                className="mt-12 pt-6 flex items-center justify-between gap-4"
                style={{ borderTop: '1px solid var(--ch-border)' }}
            >
                {prev ? (
                    <Link
                        href={`/control/docs/${prev.sectionId}/${prev.slug}`}
                        className="group flex items-center gap-2 max-w-[45%] text-left"
                    >
                        <ArrowLeft className="w-4 h-4 shrink-0 transition-colors" style={{ color: 'var(--ch-fg-3)' }} />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide ch-muted">Previous</p>
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--ch-fg)' }}>
                                {prev.title}
                            </p>
                        </div>
                    </Link>
                ) : <span />}
                {next ? (
                    <Link
                        href={`/control/docs/${next.sectionId}/${next.slug}`}
                        className="group flex items-center gap-2 max-w-[45%] text-right ml-auto"
                    >
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide ch-muted">Next</p>
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--ch-fg)' }}>
                                {next.title}
                            </p>
                        </div>
                        <ArrowRight className="w-4 h-4 shrink-0 transition-colors" style={{ color: 'var(--ch-fg-3)' }} />
                    </Link>
                ) : <span />}
            </nav>
        </article>
    );
}

function BreadcrumbNav({ sectionTitle, title }: { sectionTitle: string; title: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ch-fg-3)' }}>
            <Link href="/control/docs" style={{ color: 'inherit' }}>Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{sectionTitle}</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--ch-fg-2)' }}>{title}</span>
        </div>
    );
}
