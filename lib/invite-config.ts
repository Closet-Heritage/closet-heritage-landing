/**
 * Invite-flow constants. Store URLs fall back to placeholders so that local
 * development doesn't 404 before the apps are published; update env vars
 * (`NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL`) once live.
 */

export const APP_SCHEME = "closet-heritage";

export const IOS_APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  // TODO: replace with real App Store URL once approved
  "https://apps.apple.com/app/closet-heritage/id0000000000";

export const ANDROID_PACKAGE = "com.closetheritage.app";

/**
 * Play Store URL. When a `code` is provided, Google's Install Referrer API
 * will surface `?referrer=code=<CODE>` in the installed app on first launch —
 * this is what `app/index.tsx` picks up to auto-apply referral codes on
 * deferred Android installs.
 */
export function buildPlayStoreUrl(code?: string): string {
  const base = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  if (!code) return base;
  const referrer = encodeURIComponent(`code=${code}`);
  return `${base}&referrer=${referrer}`;
}

export function buildAppScheme(code: string): string {
  return `${APP_SCHEME}://invite/${code}`;
}

const CODE_REGEX = /^[A-Z0-9_-]{3,32}$/;

export function normalizeCode(raw: string): string | null {
  const upper = raw.trim().toUpperCase();
  return CODE_REGEX.test(upper) ? upper : null;
}
