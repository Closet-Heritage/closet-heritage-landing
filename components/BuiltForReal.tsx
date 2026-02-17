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
    <section className="bg-[#FFF5E7] pt-16 md:pt-24">
      {/* Text content */}
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12 pb-12">
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

      {/* Gallery — images sit at the bottom edge of the bg */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-6 lg:px-12" style={{ minWidth: "max-content" }}>
          {gallery.map((img, i) => (
            <div
              key={i}
              className="relative w-[300px] md:w-[380px] lg:w-[440px] aspect-[3/4] overflow-hidden flex-shrink-0"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 300px, (max-width: 1024px) 380px, 440px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
