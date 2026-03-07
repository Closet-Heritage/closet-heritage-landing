"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function ViewTracker({ shareCode }: { shareCode: string }) {
  useEffect(() => {
    posthog.capture("shared_outfit_viewed", { share_code: shareCode });
  }, [shareCode]);

  return null;
}
