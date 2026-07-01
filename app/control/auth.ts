'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    CONTROL_COOKIE_NAME,
    issueToken,
    verifyPassword,
    verifyToken,
    roleForName,
    type ControlSession,
} from '@/lib/control-auth';

const MAX_AGE_S = 7 * 24 * 60 * 60; // 7 days

/**
 * Login.
 *
 * The single shared CONTROL_PASSWORD authenticates. Role is bound to the
 * user's typed name via `roleForName()` server-side — the form does NOT
 * let the client choose their role, so anyone with the password cannot
 * escalate to `owner`.
 *
 * Add per-person passwords later by hashing each with Argon2id and
 * storing an `admins` table keyed by hash. Also add a rate limiter
 * (Vercel KV / Upstash) once we have real usage.
 */
export async function loginAction(formData: FormData) {
    const password = String(formData.get('password') ?? '');
    const name = String(formData.get('name') ?? '').trim() || 'Admin';

    if (!password) {
        return { ok: false as const, error: 'Enter the password' };
    }

    const valid = await verifyPassword(password);
    if (!valid) {
        return { ok: false as const, error: 'Wrong password' };
    }

    const role = roleForName(name);
    const token = await issueToken({ role, name });
    const jar = await cookies();
    jar.set(CONTROL_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE_S,
    });
    return { ok: true as const };
}

export async function logoutAction() {
    const jar = await cookies();
    jar.delete(CONTROL_COOKIE_NAME);
    redirect('/control/login');
}

/** Read + verify the current session. Returns null when not logged in. */
export async function getSession(): Promise<ControlSession | null> {
    const jar = await cookies();
    const token = jar.get(CONTROL_COOKIE_NAME)?.value;
    return verifyToken(token);
}
