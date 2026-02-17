interface QuoteProps {
  text: string;
  attribution: string;
}

export default function Quote({ text, attribution }: QuoteProps) {
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

          <p className="font-heading text-2xl md:text-3xl lg:text-[40px] italic text-foreground leading-snug">
            &ldquo;{text}&rdquo;
          </p>
          <p className="mt-6 text-sm text-muted-foreground">{attribution}</p>
        </div>
      </div>
    </section>
  );
}
