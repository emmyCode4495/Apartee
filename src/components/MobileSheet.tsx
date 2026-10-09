"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders a bottom sheet + backdrop into document.body so iOS Safari
 * stacking contexts (sticky + backdrop-filter ancestors) cannot block touches.
 */
export default function MobileSheet({
  open,
  onClose,
  label,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="relative z-[200]" data-mobile-sheet>
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-[200] bg-black/45 touch-manipulation"
        style={{ WebkitTapHighlightColor: "transparent" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`animate-sheet fixed inset-x-0 bottom-0 z-[210] max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lift touch-manipulation ${className}`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="mx-auto mb-3 h-1.5 w-11 shrink-0 rounded-full bg-border"
          aria-hidden
        />
        {children}
      </div>
    </div>,
    document.body
  );
}
