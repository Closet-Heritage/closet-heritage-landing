/**
 * Docs table of contents. Order in each section is the display order.
 * `slug` matches the filename under content/docs/<section>/<slug>.md
 *
 * Adding a new doc:
 *   1. Create content/docs/<section>/<slug>.md with frontmatter { title: "..." }
 *   2. Add an entry here so it appears in the sidebar.
 */

export type DocMeta = {
    slug: string;
    title: string;
    /** Optional 1-line subtitle shown in the sidebar. */
    sub?: string;
};

export type DocSection = {
    id: string;
    title: string;
    docs: DocMeta[];
};

export const DOCS_TOC: DocSection[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        docs: [
            { slug: 'overview', title: 'Overview', sub: 'What Closet Heritage is' },
            { slug: 'local-setup', title: 'Local setup', sub: 'Get all 3 repos running' },
            { slug: 'repo-layout', title: 'Repo layout', sub: 'Which code lives where' },
            { slug: 'glossary', title: 'Glossary', sub: 'Terms used across the codebase' },
        ],
    },
    {
        id: 'architecture',
        title: 'Architecture',
        docs: [
            { slug: 'system-overview', title: 'System overview', sub: 'How the pieces talk' },
            { slug: 'data-model', title: 'Data model', sub: 'Every table + relationships' },
            { slug: 'auth-flow', title: 'Auth flow', sub: 'Sign-in, AI consent, RLS' },
            { slug: 'analytics', title: 'Analytics', sub: 'PostHog events + funnels' },
        ],
    },
    {
        id: 'backend',
        title: 'Backend (ch-backend-main)',
        docs: [
            { slug: 'overview', title: 'Overview', sub: 'Fastify + Drizzle layout' },
            { slug: 'routes', title: 'Route reference', sub: 'Every HTTP endpoint' },
            { slug: 'services', title: 'Services', sub: 'Business-logic layer' },
            { slug: 'database', title: 'Database schema', sub: 'Drizzle + migrations + RLS' },
            { slug: 'cron', title: 'Cron jobs', sub: 'Scheduled work' },
        ],
    },
    {
        id: 'mobile',
        title: 'Mobile (closet-heritage-app)',
        docs: [
            { slug: 'overview', title: 'Overview', sub: 'Expo + React Query + Zustand' },
            { slug: 'screens', title: 'Screen map', sub: 'Every screen and its route' },
            { slug: 'state', title: 'State management', sub: 'Zustand stores + auth' },
            { slug: 'hooks', title: 'Hooks', sub: 'React Query + custom hooks' },
            { slug: 'theme', title: 'Theme & styling', sub: 'NativeWind + dark mode' },
        ],
    },
    {
        id: 'features',
        title: 'Features',
        docs: [
            { slug: 'onboarding', title: 'Onboarding', sub: '7-step signup flow' },
            { slug: 'wardrobe-ai', title: 'Wardrobe + AI pipeline', sub: 'Photo → tagged items' },
            { slug: 'outfit-matching', title: 'Outfit matching', sub: 'How suggestions are picked' },
            { slug: 'virtual-tryon', title: 'Virtual try-on', sub: 'Gemini image generation' },
            { slug: 'sharing', title: 'Sharing & comments', sub: 'Public outfits + moderation' },
            { slug: 'payments-coins', title: 'Payments & coins', sub: 'RevenueCat + Paystack + coin economy' },
            { slug: 'referrals', title: 'Referrals & promo codes', sub: 'Ambassador + gift codes' },
            { slug: 'starter-wardrobe', title: 'Starter wardrobe', sub: 'Persona-pick + banner' },
        ],
    },
    {
        id: 'runbooks',
        title: 'Runbooks',
        docs: [
            { slug: 'unlock-scw', title: 'Unlock Smart Casual Weekend', sub: 'After landing redeploy' },
            { slug: 'reseed-user', title: 'Re-seed a stuck user', sub: 'When starter claim was orphaned' },
            { slug: 'refund-payment', title: 'Refund a payment', sub: 'Paystack + RevenueCat' },
            { slug: 'tryon-failure', title: 'Investigate a try-on failure', sub: 'Log traces + Gemini status' },
            { slug: 'reported-comment', title: 'Handle a reported comment', sub: 'Moderation queue' },
        ],
    },
    {
        id: 'reference',
        title: 'Reference',
        docs: [
            { slug: 'env-vars', title: 'Env vars', sub: 'Every var across 3 repos' },
            { slug: 'error-codes', title: 'Error codes', sub: 'Every ApiErrorCode' },
            { slug: 'third-party', title: 'Third-party services', sub: 'Supabase, Gemini, PostHog, RC, Paystack' },
        ],
    },
];

export function findDoc(sectionId: string, slug: string): { section: DocSection; doc: DocMeta } | null {
    const section = DOCS_TOC.find(s => s.id === sectionId);
    if (!section) return null;
    const doc = section.docs.find(d => d.slug === slug);
    if (!doc) return null;
    return { section, doc };
}

/** All docs flattened, with `[sectionId, doc]` tuples. Used for prev/next nav. */
export function flatDocs(): { sectionId: string; sectionTitle: string; slug: string; title: string }[] {
    const out: { sectionId: string; sectionTitle: string; slug: string; title: string }[] = [];
    for (const s of DOCS_TOC) {
        for (const d of s.docs) {
            out.push({ sectionId: s.id, sectionTitle: s.title, slug: d.slug, title: d.title });
        }
    }
    return out;
}
