"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { PERSONAS } from "@/lib/demo";

/**
 * Landing-page section placed directly after HowItWorks. The user has just
 * read the three steps; this is the moment to invite them to try them.
 */
export default function TryItCallout() {
    return (
        <section
            id="try-it-callout"
            className="py-20 md:py-32 bg-surface-secondary border-y border-border"
        >
            <div className="max-w-[1100px] mx-auto px-5 md:px-8">
                {/* Editorial header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-2xl mb-12 md:mb-16"
                >
                    <p className="text-xs md:text-sm font-body text-warm-accent uppercase tracking-[0.2em] font-semibold mb-3">
                        Try before you install
                    </p>
                    <h2 className="font-heading text-3xl md:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight">
                        See it work — right here, right now.
                    </h2>
                    <p className="mt-5 text-base md:text-lg font-body text-muted-foreground leading-relaxed">
                        Pick a wardrobe and we&rsquo;ll walk you through the
                        flow: closet, outfit suggestion, virtual try-on. No
                        sign-up, no download.
                    </p>
                </motion.div>

                {/* Three persona cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10 md:mb-14">
                    {PERSONAS.map((persona, i) => (
                        <motion.div
                            key={persona.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                        >
                            <Link
                                href={`/try-it/${persona.id}`}
                                className="group block relative overflow-hidden bg-background"
                            >
                                <div className="relative aspect-[3/4] md:aspect-[2/3] bg-surface-secondary">
                                    <Image
                                        src={persona.featuredTryonUrl}
                                        alt={`${persona.label} sample outfit`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 360px"
                                        className="object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="p-5 md:p-6 border-t border-border">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] md:text-xs font-body text-warm-accent uppercase tracking-[0.18em] font-semibold mb-1.5">
                                                {persona.gender === "female" ? "Women's" : "Men's"}
                                            </p>
                                            <h3 className="font-heading text-xl font-semibold text-foreground leading-tight">
                                                {persona.label}
                                            </h3>
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
                        </motion.div>
                    ))}
                </div>

                {/* Primary CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex justify-center"
                >
                    <Link
                        href="/try-it"
                        className="inline-flex items-center gap-2.5 h-14 px-8 bg-foreground text-background text-base font-heading font-semibold tracking-wide hover:bg-foreground/90 transition-colors"
                    >
                        <Sparkles size={18} />
                        Start the demo
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
