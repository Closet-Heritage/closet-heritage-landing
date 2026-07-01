/**
 * Server-side helpers for reading + rendering markdown docs.
 * Runs at request time (dynamic = force-dynamic on the page).
 *
 * File layout under content/docs/:
 *   <section-id>/<slug>.md
 *   Example: content/docs/backend/routes.md
 *
 * Markdown output is sanitized with DOMPurify before rendering — docs
 * quote LLM output, log lines, and code snippets that could easily contain
 * accidental <script> or event-handler bleed. Only whitelisted safe HTML
 * survives to the browser.
 */
import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

const DOCS_ROOT = path.join(process.cwd(), 'content', 'docs');

// Validate the section/slug from the URL never escapes DOCS_ROOT — belt
// and suspenders against path-traversal via `../` or `%2e%2e`.
const SEGMENT_RE = /^[a-z0-9][a-z0-9-]*$/i;

export async function loadDoc(sectionId: string, slug: string): Promise<{
    html: string;
    frontmatter: Record<string, unknown>;
    isEmpty: boolean;
} | null> {
    if (!SEGMENT_RE.test(sectionId) || !SEGMENT_RE.test(slug)) return null;

    const filePath = path.join(DOCS_ROOT, sectionId, `${slug}.md`);
    // Belt-and-suspenders: ensure the resolved path stays inside DOCS_ROOT.
    if (!filePath.startsWith(DOCS_ROOT + path.sep) && filePath !== DOCS_ROOT) return null;

    let raw: string;
    try {
        raw = await fs.readFile(filePath, 'utf8');
    } catch (err) {
        // Only silence ENOENT (file genuinely doesn't exist yet). Any other
        // error — permissions, disk, Vercel file-trace omission — should
        // be visible in server logs so a broken deploy is diagnosable.
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error(`[docs] loadDoc(${sectionId}/${slug}):`, err);
        }
        return null;
    }

    const parsed = matter(raw);
    const rawHtml = await marked.parse(parsed.content, { gfm: true, breaks: false });
    const html = DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        // Allow relative + absolute links but strip inline event handlers.
        ADD_ATTR: ['target', 'rel'],
    });
    const isEmpty = parsed.content.trim().length === 0;

    return { html, frontmatter: parsed.data as Record<string, unknown>, isEmpty };
}
