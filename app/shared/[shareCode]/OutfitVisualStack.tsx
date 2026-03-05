import Image from "next/image";

interface StackItem {
  croppedImageUrl: string;
}

interface OutfitItems {
  top: StackItem | null;
  bottom: StackItem | null;
  shoes: StackItem | null;
  dress: StackItem | null;
  outerwear: StackItem | null;
  accessory: StackItem | null;
}

// Height weight for proportional distribution
const WEIGHT: Record<string, number> = {
  headwear: 1.5,
  top: 4.5,
  bottom: 5,
  shoes: 2,
  dress: 7.5,
};

// Width as percentage of container
const WIDTH_PCT: Record<string, string> = {
  headwear: "28%",
  top: "91%",
  bottom: "82%",
  shoes: "73%",
  dress: "95%",
};

/**
 * Split-view row: left half of outerwear + right half of inner garment.
 * Each half clips a full-width image to show only its respective side
 * (matches the app's OutfitVisualStack SplitLayerRow behavior).
 */
function SplitLayerRow({
  outerUri,
  innerUri,
  widthPct,
  heightPct,
}: {
  outerUri: string;
  innerUri: string;
  widthPct: string;
  heightPct: string;
}) {
  return (
    <div className="flex" style={{ width: widthPct, height: heightPct }}>
      {/* Left half: left side of outerwear (full-width image clipped to left half) */}
      <div className="relative w-1/2 h-full overflow-hidden">
        <div className="relative h-full" style={{ width: "200%" }}>
          <Image
            src={outerUri}
            alt="Outerwear"
            fill
            className="object-contain"
            sizes="400px"
          />
        </div>
      </div>
      {/* Right half: right side of inner garment (full-width image offset left) */}
      <div className="relative w-1/2 h-full overflow-hidden">
        <div className="relative h-full" style={{ width: "200%", marginLeft: "-100%" }}>
          <Image
            src={innerUri}
            alt="Top"
            fill
            className="object-contain"
            sizes="400px"
          />
        </div>
      </div>
    </div>
  );
}

export function OutfitVisualStack({ items }: { items: OutfitItems }) {
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

  if (rows.length === 0) return null;

  // Compute proportional heights as percentages
  const totalWeight = rows.reduce((sum, r) => sum + r.weight, 0);
  const gapPercent = 1; // 1% gap between rows
  const totalGapPercent = Math.max(0, rows.length - 1) * gapPercent;
  const distributable = 100 - totalGapPercent;

  const heightPct: Record<string, string> = {};
  for (const r of rows) {
    heightPct[r.key] = `${((r.weight / totalWeight) * distributable).toFixed(1)}%`;
  }

  const renderRow = (key: string, isFirst: boolean) => {
    const mt = isFirst ? "" : "mt-[1%]";

    if (key === "headwear" && hasHeadwear) {
      return (
        <div key={key} className={`relative ${mt}`} style={{ width: WIDTH_PCT.headwear, height: heightPct.headwear }}>
          <Image src={items.accessory!.croppedImageUrl} alt="Accessory" fill className="object-contain" sizes="120px" />
        </div>
      );
    }

    if (key === "dress") {
      if (hasOuterwear && innerUri) {
        return <SplitLayerRow key={key} outerUri={items.outerwear!.croppedImageUrl} innerUri={innerUri} widthPct={WIDTH_PCT.dress} heightPct={heightPct.dress} />;
      }
      const uri = hasOuterwear ? items.outerwear!.croppedImageUrl : hasDress ? items.dress!.croppedImageUrl : null;
      if (!uri) return null;
      return (
        <div key={key} className={`relative ${mt}`} style={{ width: WIDTH_PCT.dress, height: heightPct.dress }}>
          <Image src={uri} alt="Dress" fill className="object-contain" sizes="400px" />
        </div>
      );
    }

    if (key === "top") {
      if (hasOuterwear && innerUri) {
        return <SplitLayerRow key={key} outerUri={items.outerwear!.croppedImageUrl} innerUri={innerUri} widthPct={WIDTH_PCT.top} heightPct={heightPct.top} />;
      }
      const uri = hasOuterwear ? items.outerwear!.croppedImageUrl : hasTop ? items.top!.croppedImageUrl : null;
      if (!uri) return null;
      return (
        <div key={key} className={`relative ${mt}`} style={{ width: WIDTH_PCT.top, height: heightPct.top }}>
          <Image src={uri} alt="Top" fill className="object-contain" sizes="400px" />
        </div>
      );
    }

    if (key === "bottom" && hasBottom) {
      return (
        <div key={key} className={`relative ${mt}`} style={{ width: WIDTH_PCT.bottom, height: heightPct.bottom }}>
          <Image src={items.bottom!.croppedImageUrl} alt="Bottom" fill className="object-contain" sizes="350px" />
        </div>
      );
    }

    if (key === "shoes" && hasShoes) {
      return (
        <div key={key} className={`relative ${mt}`} style={{ width: WIDTH_PCT.shoes, height: heightPct.shoes }}>
          <Image src={items.shoes!.croppedImageUrl} alt="Shoes" fill className="object-contain" sizes="300px" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      {rows.map((row, i) => renderRow(row.key, i === 0))}
    </div>
  );
}
