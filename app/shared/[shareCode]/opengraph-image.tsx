import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shared outfit — Closet Heritage";
export const size = { width: 600, height: 800 };
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

// Same weights as OutfitVisualStack on web & app
const WEIGHT = {
  headwear: 1.5,
  top: 4.5,
  bottom: 5,
  shoes: 2,
  dress: 7.5,
};

// Width as fraction of 600px container (with 40px padding each side = 520px usable)
const USABLE_WIDTH = 520;
const WIDTH_RATIO = {
  headwear: 0.28,
  top: 0.91,
  bottom: 0.82,
  shoes: 0.73,
  dress: 0.95,
};

export default async function Image({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  let data: SharedData | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/shared/${shareCode}`, {
      next: { revalidate: 30 },
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
            fontSize: 36,
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

  // With try-on: show full image with slight top padding so face isn't clipped
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
            paddingTop: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.outfit.tryonImageUrl}
            alt=""
            height={780}
            style={{ objectFit: "contain" }}
          />
        </div>
      ),
      { ...size }
    );
  }

  // Without try-on: full outfit stack (matching OutfitVisualStack)
  const items = data.outfit.items;
  const isDressOutfit = !!items.dress;
  const hasOuterwear = !!items.outerwear?.croppedImageUrl;
  const hasHeadwear = !!items.accessory?.croppedImageUrl;
  const hasTop = !!items.top?.croppedImageUrl;
  const hasBottom = !!items.bottom?.croppedImageUrl;
  const hasShoes = !!items.shoes?.croppedImageUrl;
  const hasDress = !!items.dress?.croppedImageUrl;
  const hasGarmentRow = isDressOutfit ? (hasDress || hasOuterwear) : (hasTop || hasOuterwear);
  const innerUri = isDressOutfit ? items.dress?.croppedImageUrl : items.top?.croppedImageUrl;

  // Build row list with weights
  type Row = { key: string; weight: number };
  const rows: Row[] = [];
  if (hasHeadwear) rows.push({ key: "headwear", weight: WEIGHT.headwear });
  if (isDressOutfit) {
    if (hasGarmentRow) rows.push({ key: "dress", weight: WEIGHT.dress });
  } else {
    if (hasGarmentRow) rows.push({ key: "top", weight: WEIGHT.top });
    if (hasBottom) rows.push({ key: "bottom", weight: WEIGHT.bottom });
  }
  if (hasShoes) rows.push({ key: "shoes", weight: WEIGHT.shoes });

  if (rows.length === 0) {
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

  // Distribute height proportionally
  const totalWeight = rows.reduce((sum, r) => sum + r.weight, 0);
  const GAP = 8;
  const PADDING = 40;
  const availableHeight = size.height - PADDING * 2 - Math.max(0, rows.length - 1) * GAP;

  const rowHeights: Record<string, number> = {};
  for (const r of rows) {
    rowHeights[r.key] = Math.round(availableHeight * (r.weight / totalWeight));
  }

  const rowWidths: Record<string, number> = {
    headwear: Math.round(USABLE_WIDTH * WIDTH_RATIO.headwear),
    top: Math.round(USABLE_WIDTH * WIDTH_RATIO.top),
    bottom: Math.round(USABLE_WIDTH * WIDTH_RATIO.bottom),
    shoes: Math.round(USABLE_WIDTH * WIDTH_RATIO.shoes),
    dress: Math.round(USABLE_WIDTH * WIDTH_RATIO.dress),
  };

  // Render row elements
  const rowElements = rows.map((row) => {
    const h = rowHeights[row.key];
    const w = rowWidths[row.key] || USABLE_WIDTH;

    // Headwear
    if (row.key === "headwear" && hasHeadwear) {
      return (
        <img
          key="headwear"
          src={items.accessory!.croppedImageUrl}
          alt=""
          width={w}
          height={h}
          style={{ objectFit: "contain" }}
        />
      );
    }

    // Dress or Top row — may be split with outerwear
    if (row.key === "dress" || row.key === "top") {
      if (hasOuterwear && innerUri) {
        // Split view: left half of outerwear | right half of inner garment
        // Renders each image at full row width inside a half-width clipped container
        const halfWidth = Math.round(w / 2);
        return (
          <div
            key={row.key}
            style={{
              display: "flex",
              flexDirection: "row",
              width: w,
              height: h,
            }}
          >
            {/* Left half: left side of outerwear */}
            <div
              style={{
                width: halfWidth,
                height: h,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <img
                src={items.outerwear!.croppedImageUrl}
                alt=""
                width={w}
                height={h}
                style={{ objectFit: "contain" }}
              />
            </div>
            {/* Right half: right side of inner garment */}
            <div
              style={{
                width: halfWidth,
                height: h,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <img
                src={innerUri}
                alt=""
                width={w}
                height={h}
                style={{ objectFit: "contain", marginLeft: -halfWidth }}
              />
            </div>
          </div>
        );
      }

      // Single garment (outerwear alone, or top/dress alone)
      const uri = hasOuterwear
        ? items.outerwear!.croppedImageUrl
        : row.key === "dress"
          ? items.dress?.croppedImageUrl
          : items.top?.croppedImageUrl;

      if (!uri) return null;
      return (
        <img
          key={row.key}
          src={uri}
          alt=""
          width={w}
          height={h}
          style={{ objectFit: "contain" }}
        />
      );
    }

    // Bottom
    if (row.key === "bottom" && hasBottom) {
      return (
        <img
          key="bottom"
          src={items.bottom!.croppedImageUrl}
          alt=""
          width={w}
          height={h}
          style={{ objectFit: "contain" }}
        />
      );
    }

    // Shoes
    if (row.key === "shoes" && hasShoes) {
      return (
        <img
          key="shoes"
          src={items.shoes!.croppedImageUrl}
          alt=""
          width={w}
          height={h}
          style={{ objectFit: "contain" }}
        />
      );
    }

    return null;
  });

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
          padding: PADDING,
          gap: GAP,
        }}
      >
        {rowElements}
      </div>
    ),
    { ...size }
  );
}
