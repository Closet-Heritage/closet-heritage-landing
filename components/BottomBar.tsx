import Image from "next/image";
import Link from "next/link";

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

        {/* Right: Legal links */}
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
