/**
 * Demo wardrobe data — hardcoded persona configs, items, and outfit lookup.
 *
 * Pattern borrowed from glearn's demo-mode: all data is bundled into the
 * landing build, no backend involvement. Try-on images are pre-baked
 * (see ch-backend-main/scripts/generate-demo-assets.ts) and served from
 * /public/demo/.
 *
 * Three personas × 9 items × (3 tops × 3 bottoms × 3 shoes) = 81 outfit
 * combinations total, every one of them backed by a pre-rendered try-on image.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PersonaId = 'warm-neutrals' | 'bold-afrocentric' | 'modern-professional';
export type Gender = 'female' | 'male';
export type ItemCategory = 'top' | 'bottom' | 'shoes';

export interface DemoItem {
    id: string;
    category: ItemCategory;
    /** Human-friendly label, e.g. "Cream Silk Blouse" */
    label: string;
    /** Short style description shown on item detail */
    description: string;
    /** Path relative to public/, e.g. /demo/items/warm-neutrals/cream-silk-blouse.png */
    imageUrl: string;
}

export interface DemoPersona {
    id: PersonaId;
    /** Persona name shown on cards, e.g. "Warm Neutrals" */
    label: string;
    /** One-line vibe summary for the persona card */
    tagline: string;
    gender: Gender;
    avatarUrl: string;
    /** Try-on image used on persona cards (landing callout + /try-it picker). Picks
     *  a representative outfit so visitors see the actual product, not the model
     *  in a generic base layer. */
    featuredTryonUrl: string;
    tops: DemoItem[];
    bottoms: DemoItem[];
    shoes: DemoItem[];
}

export interface DemoOutfit {
    /** Stable combo identifier — `${topId}__${bottomId}__${shoesId}` */
    id: string;
    personaId: PersonaId;
    top: DemoItem;
    bottom: DemoItem;
    shoes: DemoItem;
    tryonImageUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers (private)
// ---------------------------------------------------------------------------

const itemImageUrl = (personaId: PersonaId, itemId: string) =>
    `/demo/items/${personaId}/${itemId}.png`;

const tryonImageUrl = (personaId: PersonaId, topId: string, bottomId: string, shoesId: string) =>
    `/demo/tryons/${personaId}/${topId}__${bottomId}__${shoesId}.png`;

const avatarImageUrl = (personaId: PersonaId) =>
    `/demo/avatars/${personaId}.png`;

/** Pre-selected "showcase" outfit per persona, used on the public persona cards. */
const FEATURED_OUTFIT: Record<PersonaId, [string, string, string]> = {
    'warm-neutrals': ['cream-silk-blouse', 'chocolate-wide-leg-trousers', 'nude-pointed-heels'],
    'bold-afrocentric': ['kente-print-top', 'black-palazzo-pants', 'gold-strap-heeled-sandals'],
    'modern-professional': ['charcoal-henley', 'black-slim-jeans', 'black-penny-loafers'],
};

// ---------------------------------------------------------------------------
// Personas + wardrobes (hardcoded)
// ---------------------------------------------------------------------------

const item = (
    personaId: PersonaId,
    id: string,
    category: ItemCategory,
    label: string,
    description: string,
): DemoItem => ({
    id,
    category,
    label,
    description,
    imageUrl: itemImageUrl(personaId, id),
});

export const PERSONAS: DemoPersona[] = [
    {
        id: 'warm-neutrals',
        label: 'Warm Neutrals',
        tagline: 'Modern professional wardrobe in earth tones',
        gender: 'female',
        avatarUrl: avatarImageUrl('warm-neutrals'),
        featuredTryonUrl: tryonImageUrl('warm-neutrals', ...FEATURED_OUTFIT['warm-neutrals']),
        tops: [
            item('warm-neutrals', 'cream-silk-blouse', 'top', 'Cream Silk Blouse', 'Relaxed fit, classic collar, button-front'),
            item('warm-neutrals', 'camel-turtleneck', 'top', 'Camel Turtleneck', 'Fine-knit, fitted, long sleeves'),
            item('warm-neutrals', 'rust-wrap-top', 'top', 'Rust Wrap Top', 'V-neck, tie-waist, flowing fabric'),
        ],
        bottoms: [
            item('warm-neutrals', 'chocolate-wide-leg-trousers', 'bottom', 'Chocolate Wide-Leg Trousers', 'High-waisted, flowing crepe'),
            item('warm-neutrals', 'tan-midi-skirt', 'bottom', 'Tan Midi Skirt', 'A-line, mid-calf, smooth woven'),
            item('warm-neutrals', 'cream-cigarette-pants', 'bottom', 'Cream Cigarette Pants', 'Slim straight leg, ankle length'),
        ],
        shoes: [
            item('warm-neutrals', 'nude-pointed-heels', 'shoes', 'Nude Pointed Heels', 'Mid-height stiletto, slip-on'),
            item('warm-neutrals', 'brown-loafers', 'shoes', 'Brown Loafers', 'Classic penny-loafer, low heel'),
            item('warm-neutrals', 'black-ankle-boots', 'shoes', 'Black Ankle Boots', 'Sleek, low block heel, side zip'),
        ],
    },
    {
        id: 'bold-afrocentric',
        label: 'Bold Afrocentric',
        tagline: 'Kente-inspired with confident pattern pairing',
        gender: 'female',
        avatarUrl: avatarImageUrl('bold-afrocentric'),
        featuredTryonUrl: tryonImageUrl('bold-afrocentric', ...FEATURED_OUTFIT['bold-afrocentric']),
        tops: [
            item('bold-afrocentric', 'kente-print-top', 'top', 'Kente Print Top', 'Authentic Ghanaian kente, fitted, short sleeves'),
            item('bold-afrocentric', 'solid-burgundy-blouse', 'top', 'Burgundy Blouse', 'Solid deep burgundy, 3/4 sleeves, scoop neck'),
            item('bold-afrocentric', 'solid-black-scoop-top', 'top', 'Black Scoop Top', 'Solid jet black, sleeveless, fitted'),
        ],
        bottoms: [
            item('bold-afrocentric', 'kente-a-line-skirt', 'bottom', 'Kente A-Line Skirt', 'Authentic Ghanaian kente, high-waisted, knee-length'),
            item('bold-afrocentric', 'black-palazzo-pants', 'bottom', 'Black Palazzo Pants', 'Wide flowing leg, high-waisted'),
            item('bold-afrocentric', 'classic-denim-straight', 'bottom', 'Classic Denim', 'Straight leg, mid-wash indigo'),
        ],
        shoes: [
            item('bold-afrocentric', 'gold-strap-heeled-sandals', 'shoes', 'Gold Strap Sandals', 'Mid-block heel, polished gold straps'),
            item('bold-afrocentric', 'black-ballet-flats', 'shoes', 'Black Ballet Flats', 'Smooth leather, round toe, no heel'),
            item('bold-afrocentric', 'cream-statement-heels', 'shoes', 'Cream Statement Heels', 'Sculptural mid-heel, single strap'),
        ],
    },
    {
        id: 'modern-professional',
        label: 'Modern Professional',
        tagline: 'Sharp, contemporary, mostly neutral with a sneaker option',
        gender: 'male',
        avatarUrl: avatarImageUrl('modern-professional'),
        featuredTryonUrl: tryonImageUrl('modern-professional', ...FEATURED_OUTFIT['modern-professional']),
        tops: [
            item('modern-professional', 'white-dress-shirt', 'top', 'White Dress Shirt', 'Crisp cotton, classic spread collar, button cuffs'),
            item('modern-professional', 'navy-polo', 'top', 'Navy Polo', 'Pique cotton, short sleeves, two-button placket'),
            item('modern-professional', 'charcoal-henley', 'top', 'Charcoal Henley', 'Fine-knit, long sleeves, three-button neckline'),
        ],
        bottoms: [
            item('modern-professional', 'navy-chinos', 'bottom', 'Navy Chinos', 'Slim straight, cotton twill, no pleats'),
            item('modern-professional', 'grey-wool-trousers', 'bottom', 'Grey Wool Trousers', 'Slim straight, pressed crease'),
            item('modern-professional', 'black-slim-jeans', 'bottom', 'Black Slim Jeans', 'Solid black denim, no distressing'),
        ],
        shoes: [
            item('modern-professional', 'brown-derbys', 'shoes', 'Brown Derbys', 'Smooth leather, classic lace-up'),
            item('modern-professional', 'white-minimal-sneakers', 'shoes', 'White Sneakers', 'All-white leather, low-top, minimalist'),
            item('modern-professional', 'black-penny-loafers', 'shoes', 'Black Penny Loafers', 'Smooth leather, slip-on, low heel'),
        ],
    },
];

// ---------------------------------------------------------------------------
// Derived data + helpers (public)
// ---------------------------------------------------------------------------

/** Get a persona by id, or undefined if the id doesn't match. */
export function getPersona(id: string): DemoPersona | undefined {
    return PERSONAS.find((p) => p.id === id);
}

/**
 * Build the full list of outfits for a persona (3 tops × 3 bottoms × 3 shoes = 27).
 * Each outfit's tryonImageUrl points at the pre-baked PNG that matches the combo.
 */
export function getOutfitsForPersona(persona: DemoPersona): DemoOutfit[] {
    const outfits: DemoOutfit[] = [];
    for (const top of persona.tops) {
        for (const bottom of persona.bottoms) {
            for (const shoe of persona.shoes) {
                outfits.push({
                    id: `${top.id}__${bottom.id}__${shoe.id}`,
                    personaId: persona.id,
                    top,
                    bottom,
                    shoes: shoe,
                    tryonImageUrl: tryonImageUrl(persona.id, top.id, bottom.id, shoe.id),
                });
            }
        }
    }
    return outfits;
}

/**
 * Get the pre-baked try-on URL for a specific (top, bottom, shoes) tuple in a
 * persona. Returns null when any item id doesn't belong to that persona.
 */
export function lookupTryon(
    personaId: PersonaId,
    topId: string,
    bottomId: string,
    shoesId: string,
): string | null {
    const persona = getPersona(personaId);
    if (!persona) return null;
    const hasTop = persona.tops.some((t) => t.id === topId);
    const hasBottom = persona.bottoms.some((b) => b.id === bottomId);
    const hasShoes = persona.shoes.some((s) => s.id === shoesId);
    if (!hasTop || !hasBottom || !hasShoes) return null;
    return tryonImageUrl(personaId, topId, bottomId, shoesId);
}
