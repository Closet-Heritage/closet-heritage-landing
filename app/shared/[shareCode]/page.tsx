import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "./CommentSection";
import { ImageLightbox } from "./ImageLightbox";
import { OutfitVisualStack } from "./OutfitVisualStack";
import { FullscreenOverlay } from "./FullscreenOverlay";

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
      next: { revalidate: 60 },
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

        {/* Message */}
        {data.message && (
          <div className="animate-fade-in-up delay-1 border-l-2 border-warm-accent pl-4 mb-3">
            <p className="text-base text-[15px] font-body text-foreground leading-relaxed italic">
              {data.message}
            </p>
            <p className="text-xs font-body text-muted-foreground mt-1">
              — {ownerName}
            </p>
          </div>
        )}

        {/* Outfit label */}
        {outfitLabel && (
          <h1 className="animate-fade-in-up delay-1 text-[20px] font-heading font-semibold text-foreground mb-2">
            {outfitLabel}
          </h1>
        )}

        {/* Outfit visual — try-on image or stacked items */}
        <div className="animate-fade-in-up delay-2 mb-8 flex justify-center">
          {data.outfit.tryonImageUrl ? (
            <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden border border-border">
              <ImageLightbox
                src={data.outfit.tryonImageUrl}
                alt={outfitLabel}
                fill
                className="object-contain bg-surface-secondary"
                sizes="400px"
                priority
              />
            </div>
          ) : items.length > 0 && (
            <div className="w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-surface-secondary p-4">
              <FullscreenOverlay>
                <OutfitVisualStack items={data.outfit.items} />
              </FullscreenOverlay>
            </div>
          )}
        </div>

        {/* Outfit items grid */}
        {items.length > 0 && (
          <div className="animate-fade-in-up delay-3 mb-10">
            <h2 className="text-sm font-body font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Items in this outfit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border overflow-hidden bg-surface-secondary hover:border-warm-accent transition-colors"
                >
                  <div className="relative aspect-square">
                    <ImageLightbox
                      src={item.croppedImageUrl}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="200px"
                    />
                  </div>
                  <div className="px-3 py-2 border-t border-border">
                    <p className="text-xs font-body text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-body text-muted-foreground">
                      {item.subcategory ?? item.topCategory}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="animate-fade-in-up delay-4 border-t border-border mb-8" />

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
