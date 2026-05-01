"use client";

import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Check, Coins, Loader2, ArrowLeft, AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "https://api.closetheritage.com/api/v1";

// Minimal PaystackPop type — avoids `as any` casts.
type PaystackPopInstance = {
  resumeTransaction: (
    accessCode: string,
    opts: { onSuccess?: () => void; onCancel?: () => void; onError?: () => void },
  ) => void;
};
type PaystackPopCtor = new () => PaystackPopInstance;
declare global {
  interface Window {
    PaystackPop?: PaystackPopCtor;
  }
}

type PlanId = "standard" | "premium";
type BillingCycle = "monthly" | "annual";
type CheckoutMode = "subscription" | "coin_pack";

interface PlansResponse {
  success: boolean;
  data: {
    currency: string;
    plans: Record<PlanId, {
      name: string;
      monthlyPrice: number;  // pesewas
      annualPrice: number;
      coinsPerMonth: number;
    }>;
    coinPacks: Array<{
      id: string;
      coins: number;
      priceGhs: number;  // pesewas
      label: string;
    }>;
  };
}

interface IdentityResponse {
  success: boolean;
  data?: {
    userId: string;
    firstName: string;
    maskedEmail: string;
    type: CheckoutMode;
    plan: PlanId | null;
    cycle: BillingCycle | null;
    packId: string | null;
    conflictingProvider: string | null;
  };
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  data: {
    verified: boolean;
    status: string;
    pending?: boolean;
    plan?: string | null;
    periodType?: string | null;
    amount?: number | null;
    currency?: string | null;
  };
}

function formatGhs(pesewas: number): string {
  return `GHS ${(pesewas / 100).toFixed(2)}`;
}

// Subscription feature lists — kept generic to avoid locking us into specific
// per-feature claims; matches the mobile paywall (which dropped the "X try-ons
// per month" math after Apple's Jan 2026 paywall guidance + UX redesign).
const PLAN_FEATURES: Record<PlanId, string[]> = {
  standard: [
    "50 coins every month",
    "AI virtual try-on with your photo",
    "Smart outfit suggestions",
    "Matching set detection",
    "Share outfits & get feedback",
  ],
  premium: [
    "100 coins every month",
    "AI virtual try-on with your photo",
    "Smart outfit suggestions",
    "Matching set detection",
    "Share outfits & get feedback",
  ],
};

function SubscribeContent() {
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const token = searchParams.get("token");
  // Embedded mode: when the page is opened from inside the Closet Heritage app
  // via a checkout token, hide the marketing site Navbar + BottomBar so the
  // page feels like an in-app sheet. Standalone visits (no token) still get
  // the regular site chrome.
  const embedded = !!token;
  // L-2: in-flight Paystack transactions initialized BEFORE this deploy carry
  // the legacy `callback_url=/subscribe?status=success`. Paystack's hosted
  // fallback then appends `?reference=X` producing `?status=success?reference=X`,
  // which Next.js parses as a single key `status` with value `success?reference=X`.
  // Extract the reference from that malformed string as a fallback.
  const rawStatusParam = searchParams.get("status");
  const embeddedRef = /[?&]reference=([^&]+)/.exec(rawStatusParam ?? "")?.[1] ?? null;
  const refParam =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    (embeddedRef ? decodeURIComponent(embeddedRef) : null);
  const emailParam = searchParams.get("email");
  const planParam = searchParams.get("plan");
  const cycleParam = searchParams.get("cycle");
  const typeParam = searchParams.get("type");

  // ----- Prices fetched from backend (single source of truth) -----
  const [plans, setPlans] = useState<PlansResponse["data"] | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);

  // ----- Token-mode identity state -----
  const [identity, setIdentity] = useState<IdentityResponse["data"] | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  // ----- Checkout state -----
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(
    typeParam === "coin_pack" ? "coin_pack" : "subscription",
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    planParam === "standard" ? "standard" : "premium",
  );
  // v1 launch: monthly only (annual subs deferred to v1.1 — re-enable the cycle
  // toggle below when annual SKUs are added to ASC + Play + RevenueCat).
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPackId, setSelectedPackId] = useState<string>("medium");
  const [email, setEmail] = useState(emailParam ?? "");

  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);

  // ----- Success-state (verified) -----
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<VerifyResponse["data"] | null>(null);
  // If the URL has a ?reference, Paystack bounced the user back from checkout —
  // show the "verifying" spinner immediately to avoid a flash of the form.
  const [verifying, setVerifying] = useState(!!refParam);
  const [verifyPending, setVerifyPending] = useState(false);

  // ---------------------------------------------------------------
  // Load Paystack inline script
  // ---------------------------------------------------------------
  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }
    if (document.getElementById("paystack-script")) return;
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => setPaystackReady(true);
    document.head.appendChild(script);
  }, []);

  // ---------------------------------------------------------------
  // Fetch plans (pricing source of truth)
  // ---------------------------------------------------------------
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/payment/plans`, { signal: ctrl.signal });
        const json = (await res.json()) as PlansResponse;
        if (json.success) {
          setPlans(json.data);
        } else {
          setPlansError("Could not load pricing — please refresh.");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setPlansError("Could not load pricing — please refresh.");
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ---------------------------------------------------------------
  // Token mode — fetch identity
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/payment/identity?token=${encodeURIComponent(token)}`,
          { signal: ctrl.signal },
        );
        const json = (await res.json()) as IdentityResponse;
        if (!json.success || !json.data) {
          setIdentityError(json.error ?? "This checkout link has expired.");
          return;
        }
        setIdentity(json.data);
        // Align selectors with the token's intent
        setCheckoutMode(json.data.type);
        if (json.data.plan) setSelectedPlan(json.data.plan);
        if (json.data.cycle) setBillingCycle(json.data.cycle);
        if (json.data.packId) setSelectedPackId(json.data.packId);
        // Cross-platform identity unification: mobile uses the same Supabase
        // UUID as distinct_id, so identifying here merges the two sessions
        // into one PostHog person and unlocks mobile→web funnels.
        // Pass NO person properties — checkout_mode is per-visit, not per-user.
        if (json.data.userId) {
          posthog?.identify(json.data.userId);
        }
        posthog?.capture("subscribe_identity_loaded", {
          type: json.data.type,
          conflicting_provider: json.data.conflictingProvider,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setIdentityError("Couldn't load your account details. Please reopen from the app.");
      }
    })();
    return () => ctrl.abort();
  }, [token, posthog]);

  // ---------------------------------------------------------------
  // Success-state — verify server-side before showing "all set".
  // Triggered by presence of `?reference=…` (Paystack appends it on redirect);
  // `?status=success` is a historical hint but not required.
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!refParam) {
      setVerifying(false);
      return;
    }
    const ctrl = new AbortController();
    // L-4: a ref we flip on unmount so the recursive setTimeout poll can
    // bail out without calling setState on a dead component.
    let cancelled = false;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    const shouldKeepPolling = (status: string | undefined, pending: boolean | undefined) =>
      !!pending || status === "unknown" || status === "ongoing" || status === "pending";

    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/payment/verify?reference=${encodeURIComponent(refParam)}`,
          { signal: ctrl.signal },
        );
        if (cancelled) return;
        const json = (await res.json()) as VerifyResponse;
        if (cancelled) return;
        if (json.success && json.data.verified) {
          setSuccess(true);
          setSuccessDetails(json.data);
          setVerifying(false);
          posthog?.capture("subscribe_verified", {
            plan: json.data.plan,
            status: json.data.status,
          });
          return;
        }
        // M-1: also poll when the backend reports status='unknown' — that's
        // the default when Paystack's verify API returned a status string our
        // backend didn't map (e.g. brief 'ongoing' during settlement race).
        if (json.success && shouldKeepPolling(json.data.status, json.data.pending)) {
          // Webhook hasn't landed yet — poll a few times before giving up.
          // 4 attempts × 3s = 12s, matching typical Paystack webhook latency.
          let attempts = 0;
          const maxAttempts = 4;
          const poll = async () => {
            if (cancelled) return;
            attempts++;
            try {
              const r = await fetch(
                `${BACKEND_URL}/payment/verify?reference=${encodeURIComponent(refParam)}`,
                { signal: ctrl.signal },
              );
              if (cancelled) return;
              const j = (await r.json()) as VerifyResponse;
              if (cancelled) return;
              if (j.success && j.data.verified) {
                setSuccess(true);
                setSuccessDetails(j.data);
                setVerifying(false);
                return;
              }
            } catch (err) {
              if ((err as Error).name === "AbortError") return;
              /* retry on next tick */
            }
            if (cancelled) return;
            if (attempts >= maxAttempts) {
              // Still unverified after 12s — show the "pending" screen rather
              // than bouncing the user back to the checkout form, which would
              // imply the payment didn't land.
              setVerifyPending(true);
              setVerifying(false);
              return;
            }
            pendingTimer = setTimeout(poll, 3000);
          };
          pendingTimer = setTimeout(poll, 3000);
          return;
        }
        // Verify succeeded but payment is neither verified nor pending-ish —
        // Paystack told us the charge failed or was abandoned. Drop back to
        // the form with a toast so the user can retry; showing the "pending"
        // screen here would be misleadingly optimistic.
        toast.error("Payment was not completed. Please try again.");
        setVerifying(false);
      } catch (err) {
        if (cancelled) return;
        if ((err as Error).name === "AbortError") return;
        // L7: Network failure on the initial verify call. The charge might
        // have gone through — bounce to the pending screen rather than the
        // checkout form, which would incorrectly imply "try again".
        setVerifyPending(true);
        setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
      if (pendingTimer) clearTimeout(pendingTimer);
    };
  }, [refParam, posthog]);

  // Analytics: page view
  useEffect(() => {
    posthog?.capture("subscribe_page_viewed", {
      has_token: !!token,
      type_param: typeParam,
    });
  }, [posthog, token, typeParam]);

  // ---------------------------------------------------------------
  // Derived pricing
  // ---------------------------------------------------------------
  const currentPrice = useMemo(() => {
    if (!plans) return null;
    if (checkoutMode === "coin_pack") {
      const pack = plans.coinPacks.find((p) => p.id === selectedPackId);
      return pack ? { amount: pack.priceGhs, display: pack.label } : null;
    }
    const p = plans.plans[selectedPlan];
    const amount = billingCycle === "annual" ? p.annualPrice : p.monthlyPrice;
    return { amount, display: formatGhs(amount) };
  }, [plans, checkoutMode, selectedPackId, selectedPlan, billingCycle]);

  const payDisabled = useMemo(() => {
    if (loading) return true;
    if (plansError || !plans || !currentPrice) return true;
    if (identityError) return true;
    if (token && !identity) return true;  // still loading identity
    if (token && identity?.conflictingProvider) return true;
    // NOTE: consent is validated inside handlePayment with a toast instead of
    // disabling the button silently — users were tapping an unlit button with
    // no feedback on why nothing happened.
    return !token && !email.trim();
  }, [loading, plansError, plans, currentPrice, identityError, token, identity, email]);

  // ---------------------------------------------------------------
  // Handle payment
  // ---------------------------------------------------------------
  const handlePayment = useCallback(async () => {
    if (!plans) return;

    // Token path — require explicit consent check. Doing this here (instead of
    // disabling the Pay button via payDisabled) gives the user actionable
    // feedback when they tap without checking the box.
    if (token && identity && !consentChecked) {
      toast.error("Please confirm your account by checking the box above");
      return;
    }

    // Anonymous path — validate email format client-side before hitting backend.
    if (!token) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setLoading(true);
    posthog?.capture("subscribe_pay_initialized", {
      mode: checkoutMode,
      plan: selectedPlan,
      cycle: billingCycle,
      pack_id: selectedPackId,
      has_token: !!token,
    });

    try {
      // Token path: always send the current selector state so backend honors
      // any plan/cycle/pack/mode change the user made on the web page after
      // the token was issued in the app.
      const body: Record<string, unknown> = token
        ? {
            token,
            consent: consentChecked,
            type: checkoutMode,
            ...(checkoutMode === "subscription"
              ? { plan: selectedPlan, periodType: billingCycle }
              : { packId: selectedPackId }),
          }
        : {
            email: email.trim(),
            type: checkoutMode,
            ...(checkoutMode === "subscription"
              ? { plan: selectedPlan, periodType: billingCycle }
              : { packId: selectedPackId }),
          };

      const res = await fetch(`${BACKEND_URL}/payment/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
      const data = await res.json();

      if (!data.success) {
        if (data.code === "ALREADY_SUBSCRIBED") {
          toast.error(data.error ?? "You already have an active subscription on another platform.");
        } else if (res.status === 429) {
          toast.error("Too many attempts. Please wait a minute and try again.");
        } else {
          toast.error(data.error ?? "Failed to initialize payment");
        }
        posthog?.capture("subscribe_pay_failed", { stage: "initialize", status: res.status });
        setLoading(false);
        return;
      }

      const PP = window.PaystackPop;
      if (!PP) {
        window.location.href = data.data.authorizationUrl;
        return;
      }

      const popup = new PP();
      popup.resumeTransaction(data.data.accessCode, {
        onSuccess: () => {
          posthog?.capture("subscribe_pay_succeeded", {
            reference: data.data.reference,
            mode: checkoutMode,
          });
          // Bounce through ?reference=… so refresh/share is safe. Verify runs
          // server-side; the success screen detects "pack vs sub" from the
          // transaction row, not the URL.
          const query = new URLSearchParams({ reference: data.data.reference });
          window.location.search = `?${query.toString()}`;
        },
        onCancel: () => {
          posthog?.capture("subscribe_pay_cancelled");
          toast.info("Payment cancelled");
          setLoading(false);
        },
        onError: () => {
          posthog?.capture("subscribe_pay_failed", { stage: "popup" });
          toast.error("Payment failed. Please try again.");
          setLoading(false);
        },
      });
    } catch (err) {
      if ((err as Error).name === "TimeoutError") {
        toast.error("Request timed out. Please check your connection and try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      posthog?.capture("subscribe_pay_failed", { stage: "network" });
      setLoading(false);
    }
  }, [plans, token, identity, consentChecked, email, checkoutMode, selectedPlan, billingCycle, selectedPackId, posthog]);

  // =================================================================
  // Render — verifying success
  // =================================================================
  if (verifying) {
    return (
      <>
        {!embedded && <Navbar />}
        <main className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-warm-accent" />
          <p className="text-muted-foreground">Confirming your payment…</p>
        </main>
        {!embedded && <BottomBar />}
      </>
    );
  }

  // =================================================================
  // Render — payment received but webhook still processing
  // =================================================================
  if (verifyPending) {
    return (
      <>
        {!embedded && <Navbar />}
        <main className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-warm-accent/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-warm-accent animate-spin" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Payment received
            </h1>
            <p className="text-muted-foreground mb-2">
              We&rsquo;re confirming your payment with our provider. This usually takes under a minute.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              You&rsquo;ll see the update in the Closet Heritage app shortly. It&rsquo;s safe to close this page.
            </p>
            <Link href="/">
              <Button className="rounded-none h-11 px-8 bg-btn-cta hover:bg-btn-cta-hover text-foreground font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Button>
            </Link>
          </div>
        </main>
        {!embedded && <BottomBar />}
      </>
    );
  }

  // =================================================================
  // Render — success (verified)
  // =================================================================
  if (success) {
    const isPack = successDetails?.plan === "coin_pack";
    return (
      <>
        {!embedded && <Navbar />}
        <main className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-[#3A9E7A]/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#3A9E7A]" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isPack ? "Coins on the way!" : "You're all set!"}
            </h1>
            <p className="text-muted-foreground mb-2">
              {isPack
                ? "Your coins have been added to your account. Open the Closet Heritage app to start using them."
                : "Your subscription is now active. Open the Closet Heritage app to start using your coins."}
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              It may take a few seconds to appear in the app. If you don&apos;t see it right away, pull down to refresh.
            </p>
            <Link href="/">
              <Button className="rounded-none h-11 px-8 bg-btn-cta hover:bg-btn-cta-hover text-foreground font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Button>
            </Link>
          </div>
        </main>
        {!embedded && <BottomBar />}
      </>
    );
  }

  // =================================================================
  // Render — the checkout UI
  // =================================================================
  const plan = plans?.plans[selectedPlan];
  const pack = plans?.coinPacks.find((p) => p.id === selectedPackId);

  return (
    <>
      {!embedded && <Navbar />}
      <main className="max-w-[920px] mx-auto px-6 lg:px-12 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-warm-accent/15 flex items-center justify-center mx-auto mb-5">
            {checkoutMode === "coin_pack" ? (
              <Coins className="w-8 h-8 text-warm-accent" />
            ) : (
              <Crown className="w-8 h-8 text-warm-accent" />
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-bold text-foreground mb-3">
            {checkoutMode === "coin_pack" ? "Buy coins" : "Subscribe to Closet Heritage"}
          </h1>
          <p className="text-muted-foreground max-w-[500px] mx-auto">
            Pay with Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo) or card.
          </p>
        </div>

        {/* Mode tabs — hidden when a token locks the intent (app already chose) */}
        {!token && (
          <div
            className="flex border border-border mb-6 max-w-[420px] mx-auto"
            role="tablist"
            aria-label="Checkout type"
          >
            {(["subscription", "coin_pack"] as CheckoutMode[]).map((mode) => {
              const selected = checkoutMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setCheckoutMode(mode)}
                  role="tab"
                  aria-selected={selected}
                  className={`flex-1 py-3 text-sm font-body font-medium transition-colors ${
                    selected
                      ? "bg-warm-accent/15 text-warm-accent border-b-2 border-warm-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "subscription" ? "Subscribe" : "Buy coins"}
                </button>
              );
            })}
          </div>
        )}

        {plansError && (
          <div className="max-w-[500px] mx-auto mb-6 p-4 border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            {plansError}
          </div>
        )}

        {identityError && (
          <div className="max-w-[500px] mx-auto mb-6 p-4 border border-destructive/30 bg-destructive/5 text-destructive text-sm text-center">
            <AlertTriangle className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
            {identityError}
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
          {/* =============================================
              LEFT — plan/pack selection
              ============================================= */}
          <div className="animate-fade-in-up delay-1">
            {checkoutMode === "subscription" && plan && (
              <>
                <div
                  className="flex border border-border mb-6"
                  role="tablist"
                  aria-label="Plan tier"
                >
                  {(["standard", "premium"] as PlanId[]).map((tier) => {
                    const selected = selectedPlan === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => !token && setSelectedPlan(tier)}
                        disabled={!!token && selectedPlan !== tier}
                        role="tab"
                        aria-selected={selected}
                        className={`flex-1 py-3 text-sm font-body font-medium transition-colors ${
                          selected
                            ? "bg-warm-accent/15 text-warm-accent border-b-2 border-warm-accent"
                            : "text-muted-foreground hover:text-foreground disabled:opacity-50"
                        }`}
                      >
                        {tier === "standard" ? "Standard" : "Premium"}
                      </button>
                    );
                  })}
                </div>

                {/* v1: monthly only. When annual SKUs ship in v1.1, restore the 2-column toggle. */}
                <div className="mb-6">
                  <div className="p-4 border border-warm-accent bg-warm-accent/5">
                    <div className="text-sm font-medium mb-1">Monthly subscription</div>
                    <div className="text-xl font-heading font-bold">
                      {formatGhs(plan.monthlyPrice)}
                      <span className="text-sm font-body text-muted-foreground"> per month</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  {PLAN_FEATURES[selectedPlan].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#3A9E7A]/12 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#3A9E7A]" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 p-4 bg-section-warm border border-border">
                  <Coins className="w-5 h-5 text-warm-accent shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">{plan.coinsPerMonth} coins</span> deposited every month.
                    Spend them on virtual try-on, smart outfit suggestions, and other premium features.
                  </div>
                </div>
              </>
            )}

            {checkoutMode === "coin_pack" && plans && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  One-time coin pack. Non-refundable, never expires.
                </p>
                {plans.coinPacks.map((p) => {
                  const selected = selectedPackId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => !token && setSelectedPackId(p.id)}
                      disabled={!!token && selectedPackId !== p.id}
                      aria-pressed={selected}
                      className={`w-full p-4 border text-left transition-colors ${
                        selected
                          ? "border-warm-accent bg-warm-accent/5"
                          : "border-border hover:border-warm-accent/40 disabled:opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-heading font-semibold">{p.coins} coins</div>
                        <div className="text-lg font-heading font-bold">{p.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================
              RIGHT — checkout card
              ============================================= */}
          <div className="animate-fade-in-up delay-2">
            <div className="border border-border p-6">
              <h2 className="font-heading text-lg font-semibold mb-1">Checkout</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {checkoutMode === "subscription" && plan
                  ? `${plan.name} · ${billingCycle === "annual" ? "Annual" : "Monthly"} · ${currentPrice?.display ?? ""}`
                  : checkoutMode === "coin_pack" && pack
                  ? `${pack.coins} coins · ${pack.label}`
                  : "—"}
              </p>

              {/* -----------------------------------
                  Token mode — show name + consent
                  ----------------------------------- */}
              {token && identity && !identityError && (
                <>
                  <div className="border border-border p-4 mb-4 bg-surface-secondary/40">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-warm-accent/15 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-warm-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">
                          Paying as
                        </div>
                        <div className="text-base font-heading font-semibold truncate">
                          {identity.firstName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {identity.maskedEmail}
                        </div>
                      </div>
                    </div>
                  </div>

                  {identity.conflictingProvider && (
                    <div className="mb-4 p-3 border border-destructive/30 bg-destructive/5 text-xs text-destructive flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        You already have an active{" "}
                        {identity.conflictingProvider === "app_store"
                          ? "Apple"
                          : identity.conflictingProvider === "play_store"
                          ? "Google Play"
                          : identity.conflictingProvider}{" "}
                        subscription. Cancel it in that store before subscribing here to avoid double charges.
                      </span>
                    </div>
                  )}

                  <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-warm-accent"
                      aria-label="Confirm this is my account"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I confirm I&rsquo;m {identity.firstName} and I authorize this payment for my
                      Closet Heritage account.
                    </span>
                  </label>
                </>
              )}

              {/* -----------------------------------
                  Anonymous mode — email entry
                  ----------------------------------- */}
              {!token && (
                <>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email address
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use the same email you signed up with in the app.
                  </p>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-11 px-3 border border-border bg-background text-foreground text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-warm-accent/50 focus:border-warm-accent mb-6"
                  />
                </>
              )}

              <Button
                onClick={handlePayment}
                disabled={payDisabled || !paystackReady}
                className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90 font-body text-sm"
                aria-label={`Pay ${currentPrice?.display ?? ""}`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !paystackReady ? (
                  "Loading secure checkout…"
                ) : (
                  `Pay ${currentPrice?.display ?? ""}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                MTN MoMo · Telecel Cash · AirtelTigo · Visa · Mastercard
              </p>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  By paying, you agree to our{" "}
                  <Link href="/terms" className="text-warm-accent hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-warm-accent hover:underline">Privacy Policy</Link>.
                  {checkoutMode === "subscription"
                    ? " Your subscription does not auto-renew via mobile money — you'll receive a reminder before each billing period."
                    : " Coins are non-refundable and do not expire."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {!embedded && <BottomBar />}
    </>
  );
}

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  );
}
