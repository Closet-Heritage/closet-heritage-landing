"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ImageLightbox({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${className ?? ""} cursor-pointer`}
        sizes={sizes}
        priority={priority}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-[90vw] h-[90vh] bg-surface-secondary rounded-lg">
            <button
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-lg z-10 w-8 h-8 rounded-full flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              aria-label="Close"
            >
              ✕
            </button>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain p-4"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
