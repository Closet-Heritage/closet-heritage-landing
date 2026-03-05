"use client";

import { useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface FullscreenOverlayProps {
  children: ReactNode;
  /** Background class for the fullscreen card. Defaults to "bg-surface-secondary". */
  className?: string;
}

export function FullscreenOverlay({ children, className = "bg-surface-secondary" }: FullscreenOverlayProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overlay = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 cursor-pointer"
      onClick={() => setOpen(false)}
    >
      <div className={`relative w-[90vw] h-[90vh] ${className} rounded-lg p-4`}>
        <button
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-lg z-10 w-8 h-8 rounded-full flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="cursor-pointer w-full h-full" onClick={() => setOpen(true)}>
        {children}
      </div>
      {mounted && overlay && createPortal(overlay, document.body)}
    </>
  );
}
