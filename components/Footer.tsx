"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    setFormState({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <section id="footer" className="relative">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/footer-bg.png)" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-[1248px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {/* Left: Heading + social */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-white leading-snug">
              Have a question, feedback,
              <br />
              or need assistance?
            </h2>

            <div className="mt-12">
              <p className="text-lg font-heading font-semibold text-white mb-4">Follow us</p>
              <div className="flex gap-4">
                {/* X (Twitter) icon */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Follow us on X"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn icon */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* TikTok icon */}
                <a
                  href="https://www.tiktok.com/@closetheritageapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Follow us on TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact form — underline-only inputs */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  placeholder="Name*"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                  className="w-full bg-transparent border-0 border-b border-white/40 text-white placeholder:text-white/50 py-3 text-sm outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email*"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                  className="w-full bg-transparent border-0 border-b border-white/40 text-white placeholder:text-white/50 py-3 text-sm outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <input
                  placeholder="Message*"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  required
                  className="w-full bg-transparent border-0 border-b border-white/40 text-white placeholder:text-white/50 py-3 text-sm outline-none focus:border-white transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="rounded-none h-12 px-10 bg-[#F5E9DA] text-foreground hover:bg-[#EDE0D0] border-0 w-full sm:w-auto mt-4"
              >
                {sent ? "Message sent!" : "Send message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
