"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Try demo", href: "/try-it" },
  { label: "Benefits", href: "/#features" },
  { label: "FAQ", href: "/#faq" },
  { label: "Team", href: "/team" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleScrollToDownload = useCallback(() => {
    const target = document.getElementById("built-for-real");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12 flex items-center justify-between h-16">

        {/* Name + Slogan */}
      <Link href="/" className="justify-center items-center mt-2">
          <Image src="/images/name-slogan.png" alt="Closet Heritage" width={170} height={100} />
      </Link>


        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-black hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/#footer" className="text-sm text-black hover:text-foreground transition-colors">
            Talk to us
          </Link>
          <Link
            href="/#built-for-real"
            onClick={handleScrollToDownload}
            className="inline-flex items-center justify-center rounded-none h-10 px-4 text-sm bg-btn-cta text-foreground hover:bg-btn-cta-hover border border-border"
          >
            Get the app
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-black hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/#footer"
            className="block text-sm text-black hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            Talk to us
          </Link>
          <Link
            href="/#built-for-real"
            className="inline-flex items-center justify-center rounded-none h-10 px-4 text-sm bg-btn-cta text-foreground hover:bg-btn-cta-hover border border-border w-full"
            onClick={() => {
              setMenuOpen(false);
              handleScrollToDownload();
            }}
          >
            Get the app
          </Link>
         </div>
       )}
     </nav>
   );
}
