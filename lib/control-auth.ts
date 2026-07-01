/**
 * Control panel auth utilities.
 * Works in both Edge (middleware) and Node.js (server actions) runtimes.
 * Uses Web Crypto API which is globally available in both.
 *
 * Env vars, deliberately separate:
 *   • CONTROL_PASSWORD        — the human-typed shared login secret.
 *   • CONTROL_SIGNING_KEY     — the machine-only HMAC key for signing session
 *                               cookies. Never typed by anyone.
 *   • CONTROL_SESSION_VERSION — optional integer (default 1). Bump to
 *                               invalidate all live sessions immediately
 *                               without rotating the signing key.
 *
 * Splitting the first two means guessing the password does not grant the
 * ability to forge cookies offline. The session version gives a cheap
 * global logout for incident response ("panic-log-everyone-out").
 *
 * Session cookie shape: `v1.<payload>.<sig>` with 7-day TTL.
 */

const SALT = 'closet-heritage-control-v1';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type ControlRole = 'owner' | 'engineer';

export interface ControlSession {
    role: ControlRole;
    name: string;
    /** issued-at, ms */
    iat: number;
    /** expiry, ms */
    exp: number;
    /** Session-version stamp. Bump CONTROL_SESSION_VERSION env to revoke. */
    v: number;
}

function currentSessionVersion(): number {
    const raw = process.env.CONTROL_SESSION_VERSION;
    if (!raw) return 1;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
}

export const CONTROL_COOKIE_NAME = 'ch_control_token';

// ── HMAC utilities ─────────────────────────────────────────────

function b64urlEncode(bytes: Uint8Array): string {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecodeBytes(s: string): Uint8Array {
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function hmacSign(payload: string, secret: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return b64urlEncode(new Uint8Array(sig));
}

// ── Password hashing (constant-time compare for login) ─────────

async function hashPassword(password: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(password + ':' + SALT);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return b64urlEncode(new Uint8Array(hash));
}

/**
 * Constant-time compare of a submitted password against CONTROL_PASSWORD.
 * Both sides are hashed first so timing does not leak length.
 *
 * NOTE: SHA-256 is fast on purpose here — we compensate with rate-limit
 * and secret-split defenses. For per-user passwords upgrade to Argon2id.
 */
export async function verifyPassword(submitted: string): Promise<boolean> {
    const secret = process.env.CONTROL_PASSWORD;
    if (!secret) return false;
    const expected = await hashPassword(secret);
    const submittedHash = await hashPassword(submitted);
    if (submittedHash.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < submittedHash.length; i++) {
        mismatch |= submittedHash.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return mismatch === 0;
}

// ── Role binding (server-side) ─────────────────────────────────

/**
 * Look up the role for a given login name. Roles are assigned server-side,
 * not selected by the form — otherwise anyone with the password could
 * claim `owner`.
 *
 * Name comparison is case-insensitive + whitespace-trimmed. Unknown names
 * default to `engineer` (least-privileged).
 *
 * Team mapping (as of 2026-07):
 *   - Patience — CEO — `owner`
 *   - Ryan    — CTO — `engineer`
 *
 * Update ROLE_MAP when adding admins. Names on both sides are lowercased
 * before compare. `owner` is the CEO; `engineer` is any other admin.
 */
const ROLE_MAP: Record<string, ControlRole> = {
    'patience': 'owner',
    'ryan': 'engineer',
};

export function roleForName(rawName: string): ControlRole {
    // Match on first token so "Patience Boateng" and "Patience B." still
    // resolve to owner. Trailing whitespace or mobile autocorrect additions
    // don't silently downgrade a CEO to engineer.
    const first = rawName.trim().toLowerCase().split(/\s+/)[0] ?? '';
    return ROLE_MAP[first] ?? 'engineer';
}

// ── Session token (signed cookie) ──────────────────────────────

/** Issue a signed session token: `v1.<payload>.<sig>` with iat + exp + v. */
export async function issueToken(session: Omit<ControlSession, 'iat' | 'exp' | 'v'>): Promise<string> {
    const signingKey = process.env.CONTROL_SIGNING_KEY;
    if (!signingKey) throw new Error('CONTROL_SIGNING_KEY missing');
    const now = Date.now();
    const full: ControlSession = {
        ...session,
        iat: now,
        exp: now + TOKEN_TTL_MS,
        v: currentSessionVersion(),
    };
    const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify(full)));
    const sig = await hmacSign(payload, signingKey);
    return `v1.${payload}.${sig}`;
}

/** Verify a token → session, or null if invalid/expired/revoked. */
export async function verifyToken(token: string | undefined): Promise<ControlSession | null> {
    const signingKey = process.env.CONTROL_SIGNING_KEY;
    if (!signingKey || !token) return null;
    if (!token.startsWith('v1.')) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [, payload, sig] = parts;
    if (!payload || !sig) return null;
    const expected = await hmacSign(payload, signingKey);
    if (sig.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < sig.length; i++) {
        mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    try {
        // Decode via TextDecoder over Uint8Array so Unicode names (accents,
        // emoji) survive the round-trip instead of mojibaking through atob.
        const bytes = b64urlDecodeBytes(payload);
        const jsonText = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(jsonText) as ControlSession;
        if (parsed.role !== 'owner' && parsed.role !== 'engineer') return null;
        if (typeof parsed.name !== 'string') return null;
        if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) return null;
        // Session-version revocation. A token issued under an older version
        // of CONTROL_SESSION_VERSION is considered logged out. Tokens without
        // a `v` field (issued before this shipped) are also rejected — one-
        // time forced re-login on rollout is acceptable for a 2-person team.
        if (typeof parsed.v !== 'number' || parsed.v < currentSessionVersion()) return null;
        return parsed;
    } catch {
        return null;
    }
}
