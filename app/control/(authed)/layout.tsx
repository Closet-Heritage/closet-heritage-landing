import { redirect } from 'next/navigation';
import ControlShell from '../ControlShell';
import { getSession } from '../auth';

export const dynamic = 'force-dynamic';

/**
 * Layout for every authenticated /control page. The route group `(authed)`
 * scopes this layout so /control/login is untouched (route groups don't
 * affect URLs — files under (authed) still map to /control/*).
 *
 * middleware.ts is the primary gate; this second check ensures a broken
 * middleware config (matcher typo, missing env) still surfaces as a redirect
 * rather than a silently unprotected page.
 */
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) {
        redirect('/control/login');
    }
    return (
        <ControlShell name={session.name} role={session.role}>
            {children}
        </ControlShell>
    );
}
