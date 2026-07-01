"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // manual capture below
      // Fire $pageleave only for pages we actually captured a $pageview on.
      // The default `true` would leak /control/* pageleaves (with UUIDs in
      // the URL) even after we skip $pageview for those routes.
      capture_pageleave: "if_capture_pageview",
      person_profiles: "always",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    // Never emit $pageview from the internal /control panel. Those URLs
    // contain user UUIDs (/control/users/<uuid>) and are ops surface, not
    // product surface. capture_pageleave: 'if_capture_pageview' above
    // ensures $pageleave also skips these routes.
    if (pathname?.startsWith("/control")) return;

    if (pathname && ph) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url += "?" + searchParams.toString();
      }
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}
