import WaitlistForm from "./WaitlistForm";

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[920px] mx-auto px-6 lg:px-12">
        <div className="relative text-center py-10 px-6 md:px-12">
          {/* Corner L-brackets — top-left */}
          <span className="absolute top-0 left-0 w-4 h-px bg-foreground/30" />
          <span className="absolute top-0 left-0 h-4 w-px bg-foreground/30" />
          {/* Top-right */}
          <span className="absolute top-0 right-0 w-4 h-px bg-foreground/30" />
          <span className="absolute top-0 right-0 h-4 w-px bg-foreground/30" />
          {/* Bottom-left */}
          <span className="absolute bottom-0 left-0 w-4 h-px bg-foreground/30" />
          <span className="absolute bottom-0 left-0 h-4 w-px bg-foreground/30" />
          {/* Bottom-right */}
          <span className="absolute bottom-0 right-0 w-4 h-px bg-foreground/30" />
          <span className="absolute bottom-0 right-0 h-4 w-px bg-foreground/30" />

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
