import Image from "next/image";
import Link from "next/link";

export default function SharedOutfitNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border">
        <div className="max-w-[800px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/">
            <Image
              src="/images/name-slogan.png"
              alt="Closet Heritage"
              width={140}
              height={80}
            />
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-3">
            Outfit not found
          </h1>
          <p className="text-base font-body text-muted-foreground mb-8">
            This shared outfit link may have expired or been removed by its
            owner.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-btn-cta text-foreground font-body font-semibold text-sm hover:bg-btn-cta-hover transition-colors"
          >
            Explore Closet Heritage
          </Link>
        </div>
      </main>
    </div>
  );
}
