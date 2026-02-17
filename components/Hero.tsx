import Image from "next/image";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section id="hero" className="pt-12 md:pt-20">
      <div className="max-w-[928px] mx-auto px-6 text-center">
        <h1 className="font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.15] font-semibold text-foreground">
          Stop repeating outfits. Start styling smarter with what you already own.
        </h1>
        <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Snap your clothes, plan outfits, and get dressed with confidence — every day.
        </p>
        <div className="mt-8 flex justify-center">
          <WaitlistForm />
        </div>
      </div>

      {/* Hero image — full width */}
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
    </section>
  );
}
