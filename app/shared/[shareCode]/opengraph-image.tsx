import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shared outfit — Closet Heritage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:3000/api/v1";

interface OutfitItem {
  croppedImageUrl: string;
}

interface SharedData {
  outfit: {
    tryonImageUrl: string | null;
    items: {
      top: OutfitItem | null;
      bottom: OutfitItem | null;
      shoes: OutfitItem | null;
      dress: OutfitItem | null;
      outerwear: OutfitItem | null;
      accessory: OutfitItem | null;
    };
  };
}

function getItemsList(items: SharedData["outfit"]["items"]): OutfitItem[] {
  const slots: (keyof typeof items)[] = [
    "top",
    "bottom",
    "dress",
    "outerwear",
    "shoes",
    "accessory",
  ];
  return slots
    .map((slot) => items[slot])
    .filter((item): item is OutfitItem => item !== null);
}

export default async function Image({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  let data: SharedData | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/shared/${shareCode}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      data = json.data ?? null;
    }
  } catch {
    // fall through
  }

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF9F4",
            fontSize: 48,
            fontWeight: 700,
            color: "#291A0C",
          }}
        >
          Outfit not found
        </div>
      ),
      { ...size }
    );
  }

  const hasTryon = !!data.outfit.tryonImageUrl;
  const items = getItemsList(data.outfit.items);

  // With try-on image: full bleed, top-aligned to show face
  if (hasTryon) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F5EDE7",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.outfit.tryonImageUrl!}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
            }}
          />
        </div>
      ),
      { ...size }
    );
  }

  // Without try-on: stacked items centered
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          backgroundColor: "#F5EDE7",
          padding: 40,
        }}
      >
        {items.slice(0, 4).map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={item.croppedImageUrl}
            alt=""
            style={{
              height: items.length <= 2 ? 400 : items.length <= 3 ? 350 : 300,
              objectFit: "contain",
            }}
          />
        ))}
      </div>
    ),
    { ...size }
  );
}
