import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { DOCS_TOC } from '../../docs-config';

export default function DocsIndexPage() {
    return (
        <div className="space-y-6 max-w-[1200px]">
            <header className="flex items-center gap-3">
                <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--ch-accent-tint)', color: 'var(--ch-accent-dark)' }}
                >
                    <BookOpen className="w-5 h-5" />
                </span>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>
                        Documentation
                    </h1>
                    <p className="text-sm ch-soft mt-0.5">
                        Everything a new engineer needs to understand and edit the codebase.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCS_TOC.map(section => (
                    <section key={section.id} className="ch-card p-5">
                        <h2 className="text-[13px] font-bold tracking-tight mb-3" style={{ color: 'var(--ch-fg)' }}>
                            {section.title}
                        </h2>
                        <ul className="space-y-1.5">
                            {section.docs.map(doc => (
                                <li key={doc.slug}>
                                    <Link
                                        href={`/control/docs/${section.id}/${doc.slug}`}
                                        className="group flex items-center justify-between gap-2 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                                        style={{ color: 'var(--ch-fg)' }}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-[var(--ch-accent-dark)]" style={{ color: 'inherit' }}>{doc.title}</p>
                                            {doc.sub && <p className="text-xs ch-muted truncate">{doc.sub}</p>}
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-colors" style={{ color: 'var(--ch-fg-3)' }} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            <p className="text-xs text-center pt-4 ch-muted">
                Editing a doc? Files live under <span className="ch-kbd">content/docs/&lt;section&gt;/&lt;slug&gt;.md</span>.
                Run <span className="ch-kbd">bash scripts/sync-docs.sh</span> after editing source docs elsewhere.
            </p>
        </div>
    );
}
