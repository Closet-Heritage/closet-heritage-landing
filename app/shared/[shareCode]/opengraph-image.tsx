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

function getStackItems(items: SharedData["outfit"]["items"]): OutfitItem[] {
  const isDress = !!items.dress;
  const result: OutfitItem[] = [];
  if (isDress) {
    if (items.dress) result.push(items.dress);
  } else {
    if (items.outerwear) result.push(items.outerwear);
    else if (items.top) result.push(items.top);
    if (items.bottom) result.push(items.bottom);
  }
  if (items.shoes) result.push(items.shoes);
  return result;
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

  // With try-on: show the image top-aligned so face is visible
  if (data.outfit.tryonImageUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            backgroundColor: "#F5EDE7",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.outfit.tryonImageUrl}
            alt=""
            width={800}
          />
        </div>
      ),
      { ...size }
    );
  }

  // Without try-on: vertically stacked items
  const items = getStackItems(data.outfit.items);
  if (items.length === 0) {
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
            fontSize: 36,
            color: "#291A0C",
          }}
        >
          Shared Outfit
        </div>
      ),
      { ...size }
    );
  }

  const count = Math.min(items.length, 3);
  const heights = count === 1 ? [500] : count === 2 ? [300, 230] : [220, 200, 120];
  const widths = count === 1 ? [500] : count === 2 ? [420, 380] : [400, 360, 280];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5EDE7",
          gap: 4,
        }}
      >
        {items.slice(0, 3).map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={item.croppedImageUrl}
            alt=""
            width={widths[i]}
            height={heights[i]}
            style={{ objectFit: "contain" }}
          />
        ))}
      </div>
    ),
    { ...size }
  );
}
