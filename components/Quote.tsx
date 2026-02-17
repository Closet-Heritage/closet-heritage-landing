interface QuoteProps {
  text: string;
  attribution: string;
}

export default function Quote({ text, attribution }: QuoteProps) {
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

          <p className="font-heading text-2xl md:text-3xl lg:text-[40px] italic text-foreground leading-snug">
            &ldquo;{text}&rdquo;
          </p>
          <p className="mt-6 text-sm text-muted-foreground">{attribution}</p>
        </div>
      </div>
    </section>
  );
}
