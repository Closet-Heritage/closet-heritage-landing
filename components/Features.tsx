import Image from "next/image";

const features = [
  {
    image: "/images/phone-home.png",
    title: "Smart Outfit Planning",
    description: "Plan outfits for a day, a week, or an event.",
  },
  {
    image: "/images/phone-wardrobe.png",
    title: "Your Real Wardrobe",
    description: "No guessing — only clothes you actually own.",
  },
  {
    image: "/images/phone-outfit.png",
    title: "Style Without Stress",
    description: "Let AI suggest combinations based on your taste.",
  },
  {
    image: "/images/phone-planned.png",
    title: "Plan Ahead",
    description: "Know what you'll wear before the day starts.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-semibold text-foreground leading-tight">
            Designed to make getting
            <br />
            dressed effortless
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            We help you plan outfits that fit your day, your mood, and your
            wardrobe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {features.map((feature, i) => (
            <div key={i}>
              {/* Phone screenshot card — image anchored to bottom */}
              <div className="rounded-2xl overflow-hidden bg-[#1A1210] relative aspect-[5/4]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] aspect-[9/19]">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-contain object-bottom"
                    sizes="(max-width: 768px) 50vw, 280px"
                  />
                </div>
              </div>

              {/* Text below card */}
              <h3 className="mt-5 font-heading text-xl md:text-2xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
