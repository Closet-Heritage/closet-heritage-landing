import Image from "next/image";
import WaitlistForm from "./WaitlistForm";

const bullets = [
  "Designed for everyday wear",
  "Works with African and global fashion",
  "No pressure to buy more clothes",
];

const gallery = [
  { src: "/images/gallery-1.png", alt: "Young African man in navy suit" },
  { src: "/images/gallery-2.png", alt: "Person in orange sweater with green beanie and sunglasses" },
  { src: "/images/gallery-3.png", alt: "African woman in blue-red print dress" },
  { src: "/images/gallery-4.png", alt: "Stylish fashion look" },
];

export default function BuiltForReal() {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        <div className="bg-section-warm rounded-[32px] pt-16 md:pt-24">
          {/* Text content */}
          <div className="px-8 md:px-12 pb-12">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-semibold text-foreground leading-tight">
              Built for real people, real wardrobes.
            </h2>

            <ul className="mt-6 space-y-2">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <WaitlistForm />
            </div>
          </div>

          {/* Gallery */}
          <div className="px-8 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
