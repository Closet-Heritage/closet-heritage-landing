import WaitlistForm from "./WaitlistForm";

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[920px] mx-auto px-6 lg:px-12">
        <div className="relative text-center py-12 px-8 md:px-16">
          {/* Corner brackets — top-left */}
          <span className="absolute top-0 left-0 w-10 h-[2px] bg-warm-accent" />
          <span className="absolute top-0 left-0 h-10 w-[2px] bg-warm-accent" />
          {/* Top-right */}
          <span className="absolute top-0 right-0 w-10 h-[2px] bg-warm-accent" />
          <span className="absolute top-0 right-0 h-10 w-[2px] bg-warm-accent" />
          {/* Bottom-left */}
          <span className="absolute bottom-0 left-0 w-10 h-[2px] bg-warm-accent" />
          <span className="absolute bottom-0 left-0 h-10 w-[2px] bg-warm-accent" />
          {/* Bottom-right */}
          <span className="absolute bottom-0 right-0 w-10 h-[2px] bg-warm-accent" />
          <span className="absolute bottom-0 right-0 h-10 w-[2px] bg-warm-accent" />

          <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-semibold text-foreground leading-tight">
            Style smarter. Wear better.
            <br />
            Stress less.
          </h2>
          <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
            Start using what you already own — better.
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
