import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "./CommentSection";
import { ReactionBar } from "./ReactionBar";
import { CollapsibleItems } from "./CollapsibleItems";
import { ImageLightbox } from "./ImageLightbox";
import { OutfitVisualStack } from "./OutfitVisualStack";
import { FullscreenOverlay } from "./FullscreenOverlay";
import { ViewTracker } from "./ViewTracker";

// ============================================
// TYPES
// ============================================

interface OutfitItem {
  id: string;
  name: string;
  primaryColor: string | null;
  croppedImageUrl: string;
  subcategory: string | null;
  topCategory: string;
}

interface SharedOutfitData {
  id: string;
  shareCode: string;
  message: string | null;
  shareImageUrl: string | null;
  createdAt: string;
  outfit: {
    id: string;
    name: string | null;
    styleLabel: string | null;
    colorHarmony: string | null;
    plannedDate: string | null;
    tryonImageUrl: string | null;
    items: {
      top: OutfitItem | null;
      bottom: OutfitItem | null;
      shoes: OutfitItem | null;
      dress: OutfitItem | null;
      outerwear: OutfitItem | null;
      accessory: OutfitItem | null;
    };
  };
  owner: {
    name: string | null;
    avatarUrl: string | null;
  };
}

// ============================================
// DATA FETCHING
// ============================================

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3000/api/v1";

async function getSharedOutfit(
  shareCode: string
): Promise<SharedOutfitData | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/shared/${shareCode}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ============================================
// DYNAMIC METADATA
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}): Promise<Metadata> {
  const { shareCode } = await params;
  const data = await getSharedOutfit(shareCode);

  if (!data) {
    return { title: "Outfit Not Found — Closet Heritage" };
  }

  const ownerName = data.owner.name ?? "Someone";
  const outfitName = data.outfit.name ?? "a custom outfit";
  const title = `${ownerName} shared ${outfitName} — Closet Heritage`;
  const description =
    data.message ?? `Check out this outfit planned with Closet Heritage`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

// ============================================
// HELPERS
// ============================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getItemsList(items: SharedOutfitData["outfit"]["items"]): OutfitItem[] {
  const slots: (keyof typeof items)[] = [
    "top",
    "bottom",
    "dress",
    "outerwear",
    "shoes",
    "accessory",
  ];
  return slots
    .map((slot) => items[slot])
    .filter((item): item is OutfitItem => item !== null);
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function SharedOutfitPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const data = await getSharedOutfit(shareCode);

  if (!data) {
    notFound();
  }

  const items = getItemsList(data.outfit.items);
  const ownerName = data.owner.name ?? "Someone";
  const outfitLabel = data.outfit.name ?? "Custom Outfit";

  return (
    <div className="min-h-screen bg-background">
      <ViewTracker shareCode={shareCode} />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[800px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/">
            <Image
              src="/images/name-slogan.png"
              alt="Closet Heritage"
              width={140}
              height={80}
            />
          </Link>
          <Link
            href="/#hero"
            className="inline-block px-5 py-2 text-sm font-body font-semibold bg-btn-cta text-foreground hover:bg-btn-cta-hover border border-border transition-colors"
          >
            Get the app
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-[800px] mx-auto px-6 py-10">
        {/* Owner info */}
        <div className="animate-fade-in-up flex items-center gap-4 mb-4">
          {data.owner.avatarUrl ? (
            <ImageLightbox
              src={data.owner.avatarUrl}
              alt={ownerName}
              width={52}
              height={52}
              className="w-[52px] h-[52px] rounded-full object-cover object-top"
              lightboxBg=""
            />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xl font-heading font-semibold text-foreground">
                {ownerName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-base font-body font-semibold text-foreground">
              {ownerName}
            </p>
            <p className="text-sm font-body text-muted-foreground">
              Shared an outfit planned for {formatDate(data.outfit.plannedDate!)}
            </p>
          </div>
        </div>

        {/* Outfit label */}
        {outfitLabel && (
          <h1 className="animate-fade-in-up delay-1 text-[20px] font-heading font-semibold text-foreground mb-2">
            {outfitLabel}
          </h1>
        )}

        {/* Outfit visual — try-on image or stacked items */}
        <div className="animate-fade-in-up delay-2 mb-8 flex justify-center">
          {data.outfit.tryonImageUrl ? (
            <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden border border-border hover:border-warm-accent transition-colors">
              <ImageLightbox
                src={data.outfit.tryonImageUrl}
                alt={outfitLabel}
                fill
                className="object-contain bg-surface-secondary"
                sizes="400px"
                priority
              />
              <ReactionBar shareCode={shareCode} />
            </div>
          ) : items.length > 0 && (
            <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden border border-border hover:border-warm-accent transition-colors bg-surface-secondary p-4">
              <FullscreenOverlay>
                <OutfitVisualStack items={data.outfit.items} />
              </FullscreenOverlay>
              <ReactionBar shareCode={shareCode} />
            </div>
          )}
        </div>

        {/* Collapsible outfit items */}
        <CollapsibleItems items={items} />

        {/* Divider */}
        <div className="animate-fade-in-up delay-4 border-t border-border mb-8" />

        {/* Owner's message */}
        {data.message && (
          <div className="animate-fade-in-up delay-5 rounded-xl bg-secondary px-4 py-3 mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              {data.owner.avatarUrl ? (
                <Image
                  src={data.owner.avatarUrl}
                  alt={ownerName}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover object-top"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center">
                  <span className="text-[10px] font-heading font-semibold text-foreground">
                    {ownerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-body font-semibold text-foreground">
                {ownerName}
              </span>
              <span className="text-[10px] font-body text-muted-foreground">
                {timeAgo(data.createdAt)}
              </span>
              <span className="rounded-full px-2 py-0.5 bg-warm-accent/10 text-[9px] font-body font-semibold text-warm-accent uppercase ml-auto">
                Owner
              </span>
            </div>
            <p className="text-sm font-body text-foreground break-words leading-relaxed">
              {data.message}
            </p>
          </div>
        )}

        {/* Comments section */}
        <div className="animate-fade-in-up delay-5">
          <CommentSection shareCode={shareCode} />
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up delay-6 mt-12 mb-8 text-center py-10 px-6 bg-section-warm rounded-2xl">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
            Want to create outfits like this?
          </h2>
          <p className="text-sm font-body text-muted-foreground mb-6">
            Closet Heritage helps you digitize your wardrobe, plan outfits with
            AI, and try them on virtually.
          </p>
          <Link
            href="/#hero"
            className="inline-block px-8 py-3 bg-btn-cta text-foreground font-body font-semibold text-sm hover:bg-btn-cta-hover border border-border transition-colors"
          >
            Join the beta
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-[800px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Closet Heritage"
              width={24}
              height={24}
            />
            <span className="text-xs font-body text-muted-foreground">
              Closet Heritage
            </span>
          </Link>
          <span className="text-xs font-body text-muted-foreground">
            closetheritage.com
          </span>
        </div>
      </footer>
    </div>
  );
}
