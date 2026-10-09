import { useEffect, useRef, type RefObject } from "react";

/**
 * Outside-click / Escape dismiss. Safe on real mobile devices:
 * - no capture-phase hijacking of the opening tap
 * - delayed bind
 * - stable handler via ref (avoids effect thrash)
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    let remove: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      const onPointer = (e: Event) => {
        const target = e.target as Node | null;
        if (!target) return;
        // Ignore interaction inside sheet portals
        if (
          target instanceof Element &&
          target.closest("[data-mobile-sheet]")
        ) {
          return;
        }
        if (ref.current && !ref.current.contains(target)) {
          onCloseRef.current();
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCloseRef.current();
      };

      // bubble phase only — never steal the opening tap
      document.addEventListener("pointerdown", onPointer);
      document.addEventListener("keydown", onKey);
      remove = () => {
        document.removeEventListener("pointerdown", onPointer);
        document.removeEventListener("keydown", onKey);
      };
    }, 400);

    return () => {
      window.clearTimeout(timer);
      remove?.();
    };
  }, [ref, open]);
}
