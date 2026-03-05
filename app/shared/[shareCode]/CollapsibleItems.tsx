"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

interface OutfitItem {
  id: string;
  name: string;
  primaryColor: string | null;
  croppedImageUrl: string;
  subcategory: string | null;
  topCategory: string;
}

export function CollapsibleItems({ items }: { items: OutfitItem[] }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="animate-fade-in-up delay-3 mb-10">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 cursor-pointer hover:border-warm-accent transition-colors"
      >
        <span className="text-sm font-body font-semibold text-foreground">
          {open ? "Hide items" : `See all items in this outfit (${items.length})`}
        </span>
        {open ? (
          <ChevronDown size={18} className="text-foreground" />
        ) : (
          <ChevronRight size={18} className="text-foreground" />
        )}
      </button>

      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
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
      )}
    </div>
  );
}
