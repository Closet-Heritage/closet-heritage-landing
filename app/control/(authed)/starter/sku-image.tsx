'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Renders an SKU image with a warm fallback when the asset 404s (typical
 * for the Smart Casual Weekend persona whose 37 assets aren't in the live
 * landing deploy yet). The fallback shows the SKU name in serif-warm so
 * the executive knows what the piece was even without the visual.
 */
export function SkuImage({
    src,
    alt,
    label,
}: {
    src: string | null;
    alt: string;
    label: string;
}) {
    const [errored, setErrored] = useState(false);
    const hasSrc = !!src && !errored;

    if (!hasSrc) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center">
                <ImageOff className="w-5 h-5" style={{ color: 'var(--ch-fg-3)' }} />
                <p className="text-[10.5px] font-semibold" style={{ color: 'var(--ch-fg-2)' }}>
                    {label}
                </p>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--ch-fg-3)' }}>
                    image pending
                </p>
            </div>
        );
    }

    return (
        <Image
            src={src as string}
            alt={alt}
            fill
            unoptimized
            onError={() => setErrored(true)}
            className="object-contain"
        />
    );
}

/**
 * Persona hero avatar. Falls back to a warm gradient with the persona name
 * when the avatar image is missing.
 */
export function PersonaHero({ src, personaLabel }: { src: string | null; personaLabel: string }) {
    const [errored, setErrored] = useState(false);
    const hasSrc = !!src && !errored;

    if (!hasSrc) {
        return (
            <div
                className="w-full h-full flex items-center justify-center text-center p-4"
                style={{
                    background: 'linear-gradient(135deg, var(--ch-accent-tint), rgba(139, 107, 71, 0.18))',
                }}
            >
                <div>
                    <ImageOff className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--ch-accent-dark)' }} />
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--ch-accent-dark)' }}>
                        {personaLabel}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--ch-accent-dark)', opacity: 0.7 }}>
                        avatar pending
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Image
            src={src as string}
            alt={personaLabel}
            fill
            unoptimized
            onError={() => setErrored(true)}
            className="object-cover"
        />
    );
}
