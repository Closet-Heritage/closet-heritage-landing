"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import WaitlistForm from "./WaitlistForm";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Benefits", href: "/#features" },
  { label: "FAQ", href: "/#faq" },
  { label: "Team", href: "/team" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY.current || currentY < 50);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
        {/* Logo + brand name */}
        <Link href="/" className="flex flex-col items-center">
          <Image src="/images/logo.png" alt="Closet Heritage" width={52} height={52} />
          <span className="font-heading text-xs font-semibold text-foreground tracking-wide">
            Closet Heritage
          </span>
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
          <WaitlistForm className="text-sm" label="Join the beta" />
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
          <WaitlistForm className="text-sm w-full" label="Join the beta" />
        </div>
      )}
    </nav>
  );
}
