import Image from "next/image";

const steps = [
  {
    image: "/images/how-it-works-1.png",
    title: "Add your clothes",
    description:
      "Snap or upload photos of what you already own. From shirts to shoes, your wardrobe lives in one place.",
  },
  {
    image: "/images/how-it-works-2.png",
    title: "Plan your outfits",
    description:
      "Choose what you're dressing for — a day, a week, or an event. We help you put together outfits that make sense.",
  },
  {
    image: "/images/how-it-works-3.png",
    title: "Get styled with confidence",
    description:
      "No more guessing or repeating. Just clean, wearable outfit ideas made from your own clothes.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground">
            How it works
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
            Simple. Smart. Built around your wardrobe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="group">
              {/* Image with dashed border corner accents */}
              <div className="relative overflow-hidden rounded-2xl">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                {/* Dashed corner accents */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-dashed border-white/60 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-dashed border-white/60 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-dashed border-white/60 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-dashed border-white/60 rounded-br-lg" />
              </div>

              <h3 className="mt-6 font-heading text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
