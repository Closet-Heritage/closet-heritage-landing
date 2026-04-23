import type { NextConfig } from "next";

// Content-Security-Policy for the landing + checkout pages.
// Allows: self, Paystack checkout widget + API, PostHog analytics, Supabase
// storage (for avatar/share images), Google Fonts, and inline styles (Next.js
// emits hydration styles inline). `unsafe-inline` on scripts is required for
// Next.js runtime chunks + PostHog's bootstrapper; when we migrate away from
// those we can tighten to nonces.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.paystack.com https://standard.paystack.co",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com https://us-assets.i.posthog.com https://us.i.posthog.com",
  "connect-src 'self' https://api.closetheritage.com https://api.paystack.co https://js.paystack.co https://checkout.paystack.com https://*.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com",
  "frame-src https://checkout.paystack.com https://standard.paystack.co",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fvktorcsbhcnanyssduy.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
  },
};

export default nextConfig;
