import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPersona, getOutfitsForPersona } from "@/lib/demo";
import { TryItExperience } from "./TryItExperience";

interface PageProps {
    params: Promise<{ persona: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { persona: personaId } = await params;
    const persona = getPersona(personaId);
    if (!persona) {
        return { title: "Try it — Closet Heritage" };
    }
    return {
        title: `${persona.label} — Closet Heritage`,
        description: `${persona.tagline}. Mix and match outfits and see them on a demo model.`,
    };
}

export default async function TryItPersonaPage({ params }: PageProps) {
    const { persona: personaId } = await params;
    const persona = getPersona(personaId);
    if (!persona) {
        notFound();
    }

    const outfits = getOutfitsForPersona(persona);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                <TryItExperience persona={persona} outfits={outfits} />
            </main>
            <Footer />
        </>
    );
}
