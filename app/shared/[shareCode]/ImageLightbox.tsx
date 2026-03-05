"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  /** Background class for the fullscreen lightbox card. Defaults to "bg-surface-secondary". Pass "" to disable. */
  lightboxBg?: string;
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
  lightboxBg = "bg-surface-secondary",
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Need to wait for client mount for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  const lightbox = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 cursor-pointer"
      onClick={() => setOpen(false)}
    >
      <div className={`relative w-[90vw] h-[90vh] ${lightboxBg} rounded-lg`}>
        <button
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-lg z-10 w-8 h-8 rounded-full flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          aria-label="Close"
        >
          ✕
        </button>
        {!lightboxLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-contain p-4 ${lightboxLoaded ? "" : "opacity-0"}`}
          sizes="90vw"
          priority
          onLoad={() => setLightboxLoaded(true)}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Shimmer placeholder (visible until image loads) */}
      {!loaded && (
        <div
          className={`${fill ? "absolute inset-0" : ""} ${className ?? ""} animate-pulse bg-border/40`}
          style={!fill ? { width: width ?? "100%", height: height ?? "100%" } : undefined}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${className ?? ""} cursor-pointer ${loaded ? "" : "opacity-0"}`}
        sizes={sizes}
        priority={priority}
        onClick={() => { setOpen(true); setLightboxLoaded(false); }}
        onLoad={() => setLoaded(true)}
      />

      {/* Portal to body so overlay isn't clipped by overflow:hidden parents */}
      {mounted && lightbox && createPortal(lightbox, document.body)}
    </>
  );
}
