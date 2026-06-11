import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PERSONAS } from "@/lib/demo";
import { PersonaCards } from "./PersonaCards";

export const metadata: Metadata = {
    title: "Try it — Closet Heritage",
    description:
        "Try Closet Heritage in your browser. Pick a wardrobe, let us plan an outfit, see it on a model — no download required.",
};

export default function TryItIndex() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Editorial intro */}
                <section className="max-w-[1100px] mx-auto px-5 md:px-8 pt-12 md:pt-24 pb-10 md:pb-16">
                    <p className="text-xs md:text-sm font-body text-warm-accent uppercase tracking-[0.2em] font-semibold mb-3">
                        Demo experience · No download
                    </p>
                    <h1 className="font-heading text-4xl md:text-6xl font-semibold text-foreground leading-[1.05] tracking-tight max-w-3xl">
                        Pick a wardrobe.<br />See it styled.
                    </h1>
                    <p className="mt-6 text-base md:text-xl font-body text-muted-foreground leading-relaxed max-w-2xl">
                        Three demo closets — each curated, each tagged, each ready
                        to show you how the app works. Choose the one that fits
                        your style and we&rsquo;ll do the rest.
                    </p>
                </section>

                <PersonaCards personas={PERSONAS} />
            </main>
            <Footer />
        </>
    );
}
