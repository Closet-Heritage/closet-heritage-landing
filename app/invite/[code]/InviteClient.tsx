"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Gift, Apple, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  IOS_APP_STORE_URL,
  buildAppScheme,
  buildPlayStoreUrl,
} from "@/lib/invite-config";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(ua: string): Platform {
  const lower = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(lower)) return "ios";
  if (/android/.test(lower)) return "android";
  return "desktop";
}

// navigator.userAgent never changes during a session, so an empty subscription
// is correct. Using useSyncExternalStore avoids the React 18+ "setState inside
// an effect" anti-pattern and handles SSR/hydration cleanly.
const subscribeNoop = () => () => {};
const getPlatformSnapshot = (): Platform => detectPlatform(navigator.userAgent);
const getPlatformServerSnapshot = (): Platform => "desktop";

export function InviteClient({ code }: { code: string }) {
  const platform = useSyncExternalStore(
    subscribeNoop,
    getPlatformSnapshot,
    getPlatformServerSnapshot,
  );
  const [copied, setCopied] = useState(false);

  const playUrl = useMemo(() => buildPlayStoreUrl(code), [code]);
  const schemeUrl = useMemo(() => buildAppScheme(code), [code]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied — paste it in the app after install");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Couldn't copy — please tap the code and copy manually.");
    }
  };

  /**
   * iOS has no deferred-deep-link support without a third-party SDK, so we
   * pre-copy the code to the clipboard before sending the user to the App
   * Store. Once they install the app and open it, the onboarding flow will
   * show a "Have a referral code?" screen where they can paste.
   */
  const handleIOSClaim = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* non-fatal — the visible code on the next screen + toast still work */
    }
    window.location.href = IOS_APP_STORE_URL;
  };

  /**
   * Android is easier: the Play Store URL carries `?referrer=code=<CODE>`,
   * and the installed app reads that via the Install Referrer API on first
   * launch (see `app/index.tsx` in the mobile app).
   */
  const handleAndroidClaim = () => {
    window.location.href = playUrl;
  };

  /**
   * If the app is already installed, the custom scheme opens it directly.
   * We try the scheme first and fall back to the store after a short delay
   * if nothing intercepted the navigation.
   */
  const handleOpenInApp = () => {
    const started = Date.now();
    const fallback = setTimeout(() => {
      if (Date.now() - started < 2500) {
        if (platform === "ios") handleIOSClaim();
        else if (platform === "android") handleAndroidClaim();
      }
    }, 1500);
    window.location.href = schemeUrl;
    // Clear the fallback if the tab is hidden (app likely opened).
    const onHide = () => {
      if (document.hidden) clearTimeout(fallback);
    };
    document.addEventListener("visibilitychange", onHide, { once: true });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-12">
      {/* Header */}
      <Link href="/" className="mb-10">
        <Image
          src="/images/name-slogan.png"
          alt="Closet Heritage"
          width={180}
          height={60}
          priority
        />
      </Link>

      <section className="w-full max-w-md flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-warm-accent/15 flex items-center justify-center mb-6">
          <Gift className="w-7 h-7 text-warm-accent" />
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight">
          You&rsquo;ve been invited
        </h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
          Use this code during signup to claim free coins on Closet Heritage —
          the AI stylist that helps you wear more of what you already own.
        </p>

        {/* Code card */}
        <div className="mt-8 w-full border border-border bg-surface-secondary/40 px-6 py-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your invite code
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-2 flex items-center justify-center gap-3 w-full text-2xl md:text-3xl font-heading font-semibold tracking-[0.2em]"
            aria-label="Copy invite code"
          >
            <span>{code}</span>
            {copied ? (
              <Check className="w-5 h-5 text-warm-accent" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Tap the code to copy. We&rsquo;ll ask for it after you install the app.
          </p>
        </div>

        {/* Platform-specific CTAs */}
        <div className="mt-8 w-full flex flex-col gap-3">
          {platform === "ios" && (
            <>
              <Button size="lg" onClick={handleOpenInApp}>
                Open in Closet Heritage
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleIOSClaim}
                className="gap-2"
              >
                <Apple className="w-4 h-4" />
                Get it on the App Store
              </Button>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                We&rsquo;ve copied the code for you. After you install, open the
                app and paste it on the &ldquo;Have a referral code?&rdquo; screen.
              </p>
            </>
          )}

          {platform === "android" && (
            <>
              <Button size="lg" onClick={handleOpenInApp}>
                Open in Closet Heritage
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAndroidClaim}
                className="gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Get it on Google Play
              </Button>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your code will be applied automatically once you install and
                open the app — no typing needed.
              </p>
            </>
          )}

          {platform === "desktop" && (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Open this page on your phone to install and claim.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="outline" asChild className="gap-2 flex-1">
                  <a href={IOS_APP_STORE_URL} onClick={copyCode}>
                    <Apple className="w-4 h-4" />
                    App Store
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2 flex-1">
                  <a href={playUrl}>
                    <Smartphone className="w-4 h-4" />
                    Google Play
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>

        <Link
          href="/"
          className="mt-10 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Learn more about Closet Heritage →
        </Link>
      </section>
    </main>
  );
}
