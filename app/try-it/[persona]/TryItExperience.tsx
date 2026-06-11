"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCw, ChevronLeft } from "lucide-react";
import type { DemoPersona, DemoItem, DemoOutfit } from "@/lib/demo";
import { OutfitVisualStack } from "@/app/shared/[shareCode]/OutfitVisualStack";

interface Props {
    persona: DemoPersona;
    outfits: DemoOutfit[];
}

type Mode = "wardrobe" | "generating" | "suggestion" | "preparing-tryon" | "tryon";

const STYLE_LABELS: Record<DemoPersona["id"], string[]> = {
    "warm-neutrals": [
        "Smart casual",
        "Office to dinner",
        "Polished everyday",
        "Sunday brunch",
        "Boardroom ready",
        "Weekend coffee",
        "Date night",
    ],
    "bold-afrocentric": [
        "Cultural evening",
        "Heritage modern",
        "Confident statement",
        "Festival ready",
        "Bold workday",
        "Friday celebration",
        "Sunday gathering",
    ],
    "modern-professional": [
        "Sharp boardroom",
        "Smart casual",
        "Weekend tailored",
        "Date night",
        "Coffee meeting",
        "Friday office",
        "Conference ready",
    ],
};

const COLOR_HARMONY: Record<DemoPersona["id"], string> = {
    "warm-neutrals": "Warm earth tones",
    "bold-afrocentric": "Heritage palette",
    "modern-professional": "Neutral classics",
};

export function TryItExperience({ persona, outfits }: Props) {
    const [mode, setMode] = useState<Mode>("wardrobe");
    const [currentIndex, setCurrentIndex] = useState(0);

    const [order, setOrder] = useState<DemoOutfit[]>(outfits);
    useEffect(() => {
        const shuffled = [...outfits];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setOrder(shuffled);
    }, [outfits]);

    const currentOutfit = order[currentIndex];
    const styleLabels = STYLE_LABELS[persona.id];
    const styleLabel = styleLabels[currentIndex % styleLabels.length];
    const colorHarmony = COLOR_HARMONY[persona.id];

    const handlePlan = () => {
        setMode("generating");
        setTimeout(() => setMode("suggestion"), 1600);
    };

    const handleGenerateAnother = () => {
        setMode("generating");
        setTimeout(() => {
            setCurrentIndex((i) => (i + 1) % order.length);
            setMode("suggestion");
        }, 1400);
    };

    const handleTryOn = () => {
        setMode("preparing-tryon");
        setTimeout(() => setMode("tryon"), 2200);
    };

    const handleSeeAnother = () => {
        setCurrentIndex((i) => (i + 1) % order.length);
        setMode("generating");
        setTimeout(() => setMode("suggestion"), 1400);
    };

    const handleBackToWardrobe = () => setMode("wardrobe");

    return (
        <div className="min-h-screen bg-background">
            <StickyHeader persona={persona} mode={mode} onBack={handleBackToWardrobe} />

            <AnimatePresence mode="wait">
                {mode === "wardrobe" && (
                    <motion.div
                        key="wardrobe"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <WardrobeView persona={persona} onPlan={handlePlan} />
                    </motion.div>
                )}
                {(mode === "generating" || mode === "preparing-tryon") && (
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GeneratingView
                            label={mode === "preparing-tryon" ? "Preparing your try-on" : "Curating an outfit"}
                            messages={
                                mode === "preparing-tryon"
                                    ? ["Preparing canvas…", "Adjusting fit…", "Finalizing image…"]
                                    : ["Analyzing colors…", "Matching styles…", "Curating outfit…"]
                            }
                        />
                    </motion.div>
                )}
                {mode === "suggestion" && currentOutfit && (
                    <motion.div
                        key={`suggestion-${currentIndex}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <SuggestionView
                            outfit={currentOutfit}
                            styleLabel={styleLabel}
                            colorHarmony={colorHarmony}
                            outfitNumber={currentIndex + 1}
                            totalOutfits={order.length}
                            onTryOn={handleTryOn}
                            onGenerateAnother={handleGenerateAnother}
                        />
                    </motion.div>
                )}
                {mode === "tryon" && currentOutfit && (
                    <motion.div
                        key={`tryon-${currentIndex}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <TryonView
                            outfit={currentOutfit}
                            styleLabel={styleLabel}
                            colorHarmony={colorHarmony}
                            personaLabel={persona.label}
                            onSeeAnother={handleSeeAnother}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sticky header — compact, always there but never imposing
// ---------------------------------------------------------------------------

function StickyHeader({ persona, mode, onBack }: { persona: DemoPersona; mode: Mode; onBack: () => void }) {
    const showBack = mode !== "wardrobe";
    return (
        <div className="sticky top-16 z-40 bg-background/85 backdrop-blur-md border-b border-border">
            <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
                {showBack ? (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -ml-2 px-2"
                    >
                        <ChevronLeft size={18} />
                        Wardrobe
                    </button>
                ) : (
                    <Link
                        href="/try-it"
                        className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -ml-2 px-2"
                    >
                        <ChevronLeft size={18} />
                        All wardrobes
                    </Link>
                )}
                <div className="text-right">
                    <p className="font-heading text-sm md:text-base font-semibold text-foreground leading-tight">
                        {persona.label}
                    </p>
                    <p className="text-[11px] md:text-xs font-body text-muted-foreground leading-tight">
                        Demo wardrobe
                    </p>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Wardrobe view — items are the hero
// ---------------------------------------------------------------------------

function WardrobeView({ persona, onPlan }: { persona: DemoPersona; onPlan: () => void }) {
    const allItems = [...persona.tops, ...persona.bottoms, ...persona.shoes];
    return (
        <div className="pb-32 md:pb-16">
            <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-8 md:pb-12">
                <p className="text-xs md:text-sm font-body text-warm-accent uppercase tracking-[0.2em] font-semibold mb-3">
                    Step 1 of 3
                </p>
                <h1 className="font-heading text-3xl md:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight">
                    Take a look around
                </h1>
                <p className="mt-4 md:mt-5 text-base md:text-lg font-body text-muted-foreground leading-relaxed max-w-xl">
                    {persona.tagline}. Here are the pieces in this closet — tap below
                    when you&rsquo;re ready to see them styled together.
                </p>
            </div>

            <div className="max-w-[1100px] mx-auto px-5 md:px-8">
                <ItemSection title="Tops" items={persona.tops} delayBase={0} />
                <ItemSection title="Bottoms" items={persona.bottoms} delayBase={0.15} />
                <ItemSection title="Shoes" items={persona.shoes} delayBase={0.3} />
            </div>

            {/* Sticky bottom CTA bar (mobile + desktop) */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-md border-t border-border md:relative md:border-t-0 md:bg-transparent md:backdrop-blur-none">
                <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-4 md:py-12 md:flex md:justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onPlan}
                        className="flex items-center justify-center gap-2.5 w-full md:w-auto md:min-w-[280px] h-14 px-8 bg-foreground text-background text-base font-heading font-semibold tracking-wide hover:bg-foreground/90 transition-colors"
                    >
                        <Sparkles size={18} />
                        Plan today&rsquo;s outfit
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

function ItemSection({ title, items, delayBase }: { title: string; items: DemoItem[]; delayBase: number }) {
    return (
        <section className="mb-12 md:mb-16">
            <h2 className="font-heading text-base md:text-lg font-semibold text-foreground uppercase tracking-[0.15em] mb-5 md:mb-7">
                {title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {items.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: delayBase + i * 0.08, ease: "easeOut" }}
                    >
                        <ItemTile item={item} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function ItemTile({ item }: { item: DemoItem }) {
    return (
        <div className="group">
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={item.imageUrl}
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 320px"
                    className="object-contain p-2 md:p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                />
            </div>
            <p className="mt-2 md:mt-3 text-sm md:text-base font-body text-foreground text-center leading-snug">
                {item.label}
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Generating / preparing — branded, soft, cycling messages
// ---------------------------------------------------------------------------

function GeneratingView({ label, messages }: { label: string; messages: string[] }) {
    const [msgIdx, setMsgIdx] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 700);
        return () => clearInterval(id);
    }, [messages]);

    return (
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-32 md:py-48">
            <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 mb-8">
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-warm-accent/30"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-warm-accent border-t-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                        <Sparkles size={22} className="text-warm-accent" />
                    </div>
                </div>
                <p className="font-heading text-xl md:text-2xl font-semibold text-foreground">{label}</p>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={msgIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 text-base font-body text-muted-foreground"
                    >
                        {messages[msgIdx]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Suggestion view — outfit stack as hero, items as caption
// ---------------------------------------------------------------------------

function SuggestionView({
    outfit,
    styleLabel,
    colorHarmony,
    outfitNumber,
    totalOutfits,
    onTryOn,
    onGenerateAnother,
}: {
    outfit: DemoOutfit;
    styleLabel: string;
    colorHarmony: string;
    outfitNumber: number;
    totalOutfits: number;
    onTryOn: () => void;
    onGenerateAnother: () => void;
}) {
    return (
        <div className="pb-32 md:pb-16">
            <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-6 md:pb-10">
                <p className="text-xs md:text-sm font-body text-warm-accent uppercase tracking-[0.2em] font-semibold mb-3">
                    Step 2 of 3 · Suggestion {outfitNumber}/{totalOutfits}
                </p>
                <h1 className="font-heading text-3xl md:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight">
                    {styleLabel}
                </h1>
                <p className="mt-3 text-base md:text-lg font-body text-muted-foreground">{colorHarmony}</p>
            </div>

            <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-12 items-start">
                {/* Outfit visual stack — full hero */}
                <div className="bg-surface-secondary rounded-2xl p-6 md:p-10 h-[440px] md:h-[600px] flex items-center justify-center">
                    <OutfitVisualStack
                        items={{
                            top: { croppedImageUrl: outfit.top.imageUrl },
                            bottom: { croppedImageUrl: outfit.bottom.imageUrl },
                            shoes: { croppedImageUrl: outfit.shoes.imageUrl },
                            dress: null,
                            outerwear: null,
                            accessory: null,
                        }}
                    />
                </div>

                {/* Items + actions */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-heading text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                            In this outfit
                        </h3>
                        <ul className="space-y-3">
                            <ItemRow label="Top" item={outfit.top} />
                            <ItemRow label="Bottom" item={outfit.bottom} />
                            <ItemRow label="Shoes" item={outfit.shoes} />
                        </ul>
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex flex-col gap-3 pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onTryOn}
                            className="flex items-center justify-center gap-2.5 w-full h-14 bg-foreground text-background text-base font-heading font-semibold hover:bg-foreground/90 transition-colors"
                        >
                            <Sparkles size={18} />
                            Try it on
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={onGenerateAnother}
                            className="flex items-center justify-center gap-2 w-full h-12 text-foreground text-sm font-body-medium border border-border hover:border-foreground transition-colors"
                        >
                            <RotateCw size={14} />
                            Generate another
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile sticky CTA bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-md border-t border-border">
                <div className="px-5 py-4 flex gap-3">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onGenerateAnother}
                        className="flex items-center justify-center gap-2 h-14 px-5 text-foreground text-sm font-body-medium border border-border"
                    >
                        <RotateCw size={14} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onTryOn}
                        className="flex-1 flex items-center justify-center gap-2.5 h-14 bg-foreground text-background text-base font-heading font-semibold"
                    >
                        <Sparkles size={18} />
                        Try it on
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

function ItemRow({ label, item }: { label: string; item: DemoItem }) {
    return (
        <li className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex-shrink-0">
                <Image src={item.imageUrl} alt={item.label} fill sizes="56px" className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-[0.15em]">{label}</p>
                <p className="text-sm font-body text-foreground truncate leading-tight">{item.label}</p>
            </div>
        </li>
    );
}

// ---------------------------------------------------------------------------
// Try-on view — image is enormous, everything else supports it
// ---------------------------------------------------------------------------

function TryonView({
    outfit,
    styleLabel,
    colorHarmony,
    personaLabel,
    onSeeAnother,
}: {
    outfit: DemoOutfit;
    styleLabel: string;
    colorHarmony: string;
    personaLabel: string;
    onSeeAnother: () => void;
}) {
    return (
        <div className="pb-32 md:pb-16">
            <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-6 md:pb-10">
                <p className="text-xs md:text-sm font-body text-warm-accent uppercase tracking-[0.2em] font-semibold mb-3">
                    Step 3 of 3 · Virtual try-on
                </p>
                <h1 className="font-heading text-3xl md:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight">
                    Here it is
                </h1>
                <p className="mt-3 text-base md:text-lg font-body text-muted-foreground">
                    {styleLabel} · {colorHarmony}
                </p>
            </div>

            <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-12 items-start">
                {/* Try-on hero — fills mobile, big on desktop */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative aspect-[2/3] bg-surface-secondary rounded-2xl overflow-hidden"
                >
                    <Image
                        src={outfit.tryonImageUrl}
                        alt={`Try-on of ${styleLabel}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 700px"
                        className="object-contain"
                        priority
                    />
                </motion.div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-heading text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                            What you&rsquo;re wearing
                        </h3>
                        <ul className="space-y-3">
                            <ItemRow label="Top" item={outfit.top} />
                            <ItemRow label="Bottom" item={outfit.bottom} />
                            <ItemRow label="Shoes" item={outfit.shoes} />
                        </ul>
                    </div>

                    <div className="hidden md:flex flex-col gap-3 pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onSeeAnother}
                            className="flex items-center justify-center gap-2.5 w-full h-14 bg-foreground text-background text-base font-heading font-semibold hover:bg-foreground/90 transition-colors"
                        >
                            <RotateCw size={16} />
                            See another outfit
                        </motion.button>
                        <Link
                            href="/#built-for-real"
                            className="flex items-center justify-center w-full h-12 text-foreground text-sm font-body-medium border border-border hover:border-foreground transition-colors"
                        >
                            Get the app
                        </Link>
                    </div>

                    <p className="hidden md:block text-xs font-body text-muted-foreground leading-relaxed pt-4 border-t border-border">
                        In the real app, you upload your own clothes and your own
                        photo — and the try-on shows you wearing your own wardrobe.
                    </p>
                </div>
            </div>

            <div className="hidden md:block max-w-[1100px] mx-auto px-5 md:px-8 mt-10" />

            {/* Mobile note + sticky CTA */}
            <div className="md:hidden max-w-[1100px] mx-auto px-5 mt-8">
                <p className="text-xs font-body text-muted-foreground leading-relaxed text-center">
                    In the real app, you upload your own clothes and your own
                    photo — try-ons show you in your own wardrobe.
                </p>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-md border-t border-border">
                <div className="px-5 py-4 flex gap-3">
                    <Link
                        href="/#built-for-real"
                        className="flex items-center justify-center h-14 px-5 text-foreground text-sm font-body-medium border border-border"
                    >
                        Get the app
                    </Link>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onSeeAnother}
                        className="flex-1 flex items-center justify-center gap-2.5 h-14 bg-foreground text-background text-base font-heading font-semibold"
                    >
                        <RotateCw size={16} />
                        See another outfit
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
