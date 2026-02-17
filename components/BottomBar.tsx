import Image from "next/image";

export default function BottomBar() {
  return (
    <div className="border-t border-border py-3">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8">
        {/* Left: Full logo with name and tagline */}
        <Image
          src="/images/logo-full.png"
          alt="Closet Heritage — Preserve the story your clothes tell"
          width={200}
          height={155}
        />

        {/* Right: Terms */}
        <a
          href="#"
          className="text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors"
        >
          Terms and conditions
        </a>
      </div>
    </div>
  );
}
