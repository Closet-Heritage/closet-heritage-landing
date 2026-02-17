"use client";

import Image from "next/image";
import WaitlistForm from "./WaitlistForm";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="hero" className="pt-15 md:pt-10">
      <div className="max-w-[928px] mx-auto px-6 text-center">
        <Reveal>
          <div className="inline-block mb-6 border rounded-full px-5 py-1.5 text-sm text-muted-foreground">
           Preserve the story your clothes tell
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.15] font-semibold text-foreground">
            Stop repeating outfits. Start styling smarter with what you already own.
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              With <strong>Closet Heritage</strong>, snap your clothes, plan outfits, and get dressed with confidence — every day.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="mt-8 flex justify-center">
            <WaitlistForm />
          </div>
        </Reveal>
      </div>

      {/* Hero image — full width */}
      <Reveal delay={0.2} direction="none" duration={0.8}>
        <div className="mt-10 w-full overflow-hidden">
          <div className="relative w-full aspect-[1440/580]">
            <Image
              src="/images/hero-image.png"
              alt="Four stylish people showcasing diverse fashion — a woman in white, man in traditional print, man in dark suit, woman in navy blazer"
              fill
              className="object-cover object-top"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
