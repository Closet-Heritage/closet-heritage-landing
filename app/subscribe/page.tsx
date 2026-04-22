"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Check, Coins, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "https://api.closetheritage.com/api/v1";

type PlanId = "standard" | "premium";
type BillingCycle = "monthly" | "annual";

interface PlanConfig {
  name: string;
  monthlyPriceGHS: string;
  annualPriceGHS: string;
  annualMonthlyGHS: string;
  savingsPercent: number;
  coinsPerMonth: number;
  features: string[];
}

const PLANS: Record<PlanId, PlanConfig> = {
  standard: {
    name: "Standard",
    monthlyPriceGHS: "GHS 19.99",
    annualPriceGHS: "GHS 199.99",
    annualMonthlyGHS: "GHS 16.67",
    savingsPercent: 16,
    coinsPerMonth: 50,
    features: [
      "50 coins every month",
      "~10 virtual try-ons",
      "~50 outfit generations",
      "Matching set detection",
      "Share outfits with friends",
      "Unlimited wardrobe items",
    ],
  },
  premium: {
    name: "Premium",
    monthlyPriceGHS: "GHS 29.99",
    annualPriceGHS: "GHS 299.99",
    annualMonthlyGHS: "GHS 25.00",
    savingsPercent: 16,
    coinsPerMonth: 100,
    features: [
      "100 coins every month",
      "~20 virtual try-ons",
      "~100 outfit generations",
      "Matching set detection",
      "Share outfits with friends",
      "Unlimited wardrobe items",
      "Priority AI processing",
    ],
  },
};

function SubscribeContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const emailParam = searchParams.get("email");
  const planParam = searchParams.get("plan");
  const cycleParam = searchParams.get("cycle");

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    planParam === "standard" || planParam === "premium" ? planParam : "premium"
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    cycleParam === "monthly" || cycleParam === "annual" ? cycleParam : "annual"
  );
  const [email, setEmail] = useState(emailParam ?? "");
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [success, setSuccess] = useState(statusParam === "success");

  const plan = PLANS[selectedPlan];
  const price = billingCycle === "annual" ? plan.annualPriceGHS : plan.monthlyPriceGHS;

  // Load Paystack inline script
  useEffect(() => {
    if ((window as any).PaystackPop) {
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

  const handlePayment = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // 1. Initialize transaction on backend
      const res = await fetch(`${BACKEND_URL}/payment/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          plan: selectedPlan,
          periodType: billingCycle,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error ?? "Failed to initialize payment");
        setLoading(false);
        return;
      }

      // 2. Open Paystack popup
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) {
        // Fallback: redirect to Paystack's hosted checkout
        window.location.href = data.data.authorizationUrl;
        return;
      }

      const popup = new PaystackPop();
      popup.resumeTransaction(data.data.accessCode, {
        onSuccess: () => {
          setSuccess(true);
          toast.success("Payment successful!");
        },
        onCancel: () => {
          toast.info("Payment cancelled");
        },
        onError: () => {
          toast.error("Payment failed. Please try again.");
        },
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, selectedPlan, billingCycle]);

  // Success state
  if (success) {
    return (
      <>
        <Navbar />
        <main className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-[#3A9E7A]/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#3A9E7A]" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              You&apos;re all set!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your subscription is now active. Open the Closet Heritage app to start using your coins.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              It may take a few seconds for your subscription to appear in the app.
              If you don&apos;t see it right away, pull down to refresh.
            </p>
            <Link href="/">
              <Button className="rounded-none h-11 px-8 bg-btn-cta hover:bg-btn-cta-hover text-foreground font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Button>
            </Link>
          </div>
        </main>
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-[920px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-warm-accent/15 flex items-center justify-center mx-auto mb-5">
            <Crown className="w-8 h-8 text-warm-accent" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-bold text-foreground mb-3">
            Subscribe to Closet Heritage
          </h1>
          <p className="text-muted-foreground max-w-[500px] mx-auto">
            Pay with Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo) or card.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left: Plan selection */}
          <div className="animate-fade-in-up delay-1">
            {/* Plan toggle */}
            <div className="flex border border-border mb-6">
              {(["standard", "premium"] as PlanId[]).map((tier) => {
                const isSelected = selectedPlan === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedPlan(tier)}
                    className={`flex-1 py-3 text-sm font-body font-medium transition-colors ${
                      isSelected
                        ? "bg-warm-accent/15 text-warm-accent border-b-2 border-warm-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tier === "standard" ? "Standard" : "Premium"}
                  </button>
                );
              })}
            </div>

            {/* Billing cycle */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Annual */}
              <button
                onClick={() => setBillingCycle("annual")}
                className={`relative p-4 border text-left transition-colors ${
                  billingCycle === "annual"
                    ? "border-warm-accent bg-warm-accent/5"
                    : "border-border hover:border-warm-accent/40"
                }`}
              >
                {plan.savingsPercent > 0 && (
                  <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-[#3A9E7A] text-white text-[10px] font-medium">
                    Save {plan.savingsPercent}%
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Yearly</span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      billingCycle === "annual" ? "border-warm-accent bg-warm-accent" : "border-muted-foreground"
                    }`}
                  >
                    {billingCycle === "annual" && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <div className="text-xl font-heading font-bold">{plan.annualPriceGHS}<span className="text-sm font-body text-muted-foreground">/year</span></div>
                <div className="text-xs text-muted-foreground">{plan.annualMonthlyGHS}/mo</div>
              </button>

              {/* Monthly */}
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`p-4 border text-left transition-colors ${
                  billingCycle === "monthly"
                    ? "border-warm-accent bg-warm-accent/5"
                    : "border-border hover:border-warm-accent/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1 mt-1">
                  <span className="text-sm font-medium">Monthly</span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      billingCycle === "monthly" ? "border-warm-accent bg-warm-accent" : "border-muted-foreground"
                    }`}
                  >
                    {billingCycle === "monthly" && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <div className="text-xl font-heading font-bold">{plan.monthlyPriceGHS}<span className="text-sm font-body text-muted-foreground">/mo</span></div>
              </button>
            </div>

            {/* Features */}
            <div className="space-y-2.5 mb-6">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3A9E7A]/12 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#3A9E7A]" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Coins info */}
            <div className="flex items-center gap-3 p-4 bg-section-warm border border-border">
              <Coins className="w-5 h-5 text-warm-accent shrink-0" />
              <div className="text-sm">
                <span className="font-medium">{plan.coinsPerMonth} coins</span> deposited on each renewal.
                Each virtual try-on costs 5 coins. Coins never expire.
              </div>
            </div>
          </div>

          {/* Right: Checkout form */}
          <div className="animate-fade-in-up delay-2">
            <div className="border border-border p-6">
              <h2 className="font-heading text-lg font-semibold mb-1">Checkout</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {plan.name} · {billingCycle === "annual" ? "Annual" : "Monthly"} · {price}
              </p>

              {/* Email input */}
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <p className="text-xs text-muted-foreground mb-2">
                Use the same email you signed up with in the app.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-3 border border-border bg-background text-foreground text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-warm-accent/50 focus:border-warm-accent mb-6"
              />

              {/* Pay button */}
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90 font-body text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Pay ${price}`
                )}
              </Button>

              {/* Payment methods */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                MTN MoMo · Telecel Cash · AirtelTigo · Visa · Mastercard
              </p>

              {/* Terms */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  By subscribing, you agree to our{" "}
                  <Link href="/terms" className="text-warm-accent hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-warm-accent hover:underline">Privacy Policy</Link>.
                  Your subscription does not auto-renew via mobile money.
                  You&apos;ll receive a reminder before each billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomBar />
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
