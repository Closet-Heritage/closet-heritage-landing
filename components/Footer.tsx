"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFormState({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
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
                {/* Instagram icon */}
                <a
                  href="https://www.instagram.com/closetheritageapp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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
                {/* YouTube icon */}
                <a
                  href="https://www.youtube.com/@closetheritageapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Follow us on YouTube"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
              {status === "error" && (
                <p className="text-sm text-red-300">{errorMsg}</p>
              )}
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-none h-12 px-10 bg-btn-cta text-foreground hover:bg-btn-cta-hover border-0 w-full sm:w-auto mt-4"
              >
                {status === "loading"
                  ? "Sending..."
                  : status === "success"
                    ? "Message sent!"
                    : "Send message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
