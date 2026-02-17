import Image from "next/image";

export default function BottomBar() {
  return (
    <div className="border-t border-border py-10">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8">
        {/* Left: Logo centered above name and tagline */}
        <div className="flex flex-col items-center">
          <Image src="/images/logo.png" alt="Closet Heritage" width={72} height={72} />
          <h3 className="mt-4 text-2xl font-bold text-foreground tracking-tight">
            Closet Heritage
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Preserve the story your clothes tell
          </p>
        </div>

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
