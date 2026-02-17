"use client";

import Image from "next/image";
import WaitlistForm from "./WaitlistForm";
import Reveal from "./Reveal";

export default function Rediscover() {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        <div className="bg-btn-cta rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          {/* Text side */}
          <Reveal direction="left" className="flex-1">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-[48px] font-semibold text-foreground leading-[1.2]">
              Most people wear only a fraction of their wardrobe.
            </h2>
            <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
              Closet Heritage helps you rediscover what you already own, avoid
              repeating the same outfits and dress better without buying more
            </p>
            <div className="mt-8">
              <WaitlistForm variant="light" />
            </div>
          </Reveal>

          {/* Dark phone container */}
          <Reveal direction="right" className="flex-shrink-0 w-full md:w-auto md:flex-1">
            <div className="bg-card-dark rounded-[32px] overflow-hidden relative h-[360px] md:h-[460px] flex items-end justify-center">
              <div className="relative w-[220px] md:w-[271px] h-[90%]">
                <Image
                  src="/images/phone-onboarding.png"
                  alt="Closet Heritage onboarding screen showing Let's get styling"
                  fill
                  className="object-contain object-top"
                  sizes="271px"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
