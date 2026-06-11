"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { DemoPersona } from "@/lib/demo";

interface Props {
    personas: DemoPersona[];
}

export function PersonaCards({ personas }: Props) {
    return (
        <section className="max-w-[1100px] mx-auto px-5 md:px-8 pb-20 md:pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                {personas.map((persona, i) => (
                    <motion.div
                        key={persona.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                    >
                        <PersonaCard persona={persona} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function PersonaCard({ persona }: { persona: DemoPersona }) {
    return (
        <Link
            href={`/try-it/${persona.id}`}
            className="group block relative overflow-hidden bg-surface-secondary"
        >
            {/* Outfit image — cinematic full-bleed */}
            <div className="relative aspect-[3/4] md:aspect-[2/3]">
                <Image
                    src={persona.featuredTryonUrl}
                    alt={`${persona.label} sample outfit`}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                    priority
                />
            </div>

            {/* Card footer with editorial labels */}
            <div className="p-5 md:p-6 bg-background border-t border-border">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs font-body text-warm-accent uppercase tracking-[0.18em] font-semibold mb-1.5">
                            {persona.gender === "female" ? "Women's" : "Men's"}
                        </p>
                        <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground leading-tight">
                            {persona.label}
                        </h2>
                        <p className="mt-2 text-sm font-body text-muted-foreground leading-snug">
                            {persona.tagline}
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors">
                        <ArrowUpRight size={18} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
