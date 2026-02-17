"use client";

import Image from "next/image";
import Reveal from "./Reveal";

export default function Team() {
  return (
    <section id="team" className="py-16 md:py-24">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        {/* Origin story */}
        <Reveal>
          <div className="max-w-[800px]">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-4">
              The people behind Closet Heritage
            </p>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-snug">
              We noticed people owned more clothes than ever but felt like they had
              nothing to wear. So we built something to fix that.
            </h2>
          </div>
        </Reveal>

        {/* Founders — alternating layout */}
        <div className="mt-16 space-y-20 md:space-y-24">
          {/* Patience — photo left, bio right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal direction="left">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Image
                  src="/images/team-patience.jpg"
                  alt="Sombang Patience Nyolengma"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Reveal>
            <Reveal direction="right">
              <p className="font-body text-xs uppercase tracking-wider text-warm-accent mb-2">
                CEO & Co-Founder
              </p>
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">
                Sombang Patience Nyolengma
              </h3>
              <p className="mt-4 font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                Patience saw the disconnect firsthand — overflowing wardrobes,
                yet the daily frustration of having &quot;nothing to wear.&quot;
                She co-created Closet Heritage to change that relationship.
              </p>
              <p className="mt-3 font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                She leads business strategy, branding, and product direction —
                making sure every feature is rooted in how people actually think
                about getting dressed, not how technologists assume they do.
              </p>
            </Reveal>
          </div>

          {/* Ryan — bio left, photo right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal direction="right" className="order-1 md:order-2">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Image
                  src="/images/team-ryan.jpg"
                  alt="Ryan Tangu Mbun Tangwe"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Reveal>
            <Reveal direction="left" className="order-2 md:order-1">
              <p className="font-body text-xs uppercase tracking-wider text-warm-accent mb-2">
                CTO & Co-Founder
              </p>
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">
                Ryan Tangu Mbun Tangwe
              </h3>
              <p className="mt-4 font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                Ryan co-created Closet Heritage and designed the entire system
                from scratch — the algorithms that plan outfits around your
                schedule and preferences, the AI that recognizes and tags every
                item from a single photo, and the virtual try-on that lets you
                see it all on yourself before getting dressed.
              </p>
              <p className="mt-3 font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                He leads engineering, architecture, and product design — obsessed
                with making powerful technology feel effortless.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Mission — centered, after the founders */}
        <Reveal direction="none" duration={0.8}>
          <div className="mt-20 md:mt-28 border-t border-border pt-12 text-center max-w-[720px] mx-auto">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Our Mission
            </p>
            <p className="font-heading text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              To create simple, thoughtful experiences that help people make better
              choices with confidence — starting with the clothes they already own.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
