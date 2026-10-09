"use client";

import { useEffect, useState } from "react";
import Price from "@/components/Price";

/** Sticky price + CTA on small screens; hides while the booking card or footer is on screen. */
export default function MobileReserveBar({ pricePerNight }: { pricePerNight: number }) {
  const [hidden, setHidden] = useState({ widget: false, footer: false });

  useEffect(() => {
    const targets: [string, "widget" | "footer"][] = [
      ["#booking", "widget"],
      ["footer", "footer"],
    ];
    const observers = targets.map(([sel, key]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const io = new IntersectionObserver(([entry]) =>
        setHidden((h) => ({ ...h, [key]: entry.isIntersecting }))
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const hide = hidden.widget || hidden.footer;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 backdrop-blur transition duration-200 lg:hidden ${
        hide ? "pointer-events-none translate-y-full" : ""
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-hidden={hide}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p>
          <span className="text-lg font-semibold">
            <Price usd={pricePerNight} />
          </span>
          <span className="text-sm text-muted"> a night</span>
        </p>
        <a
          href="#booking"
          tabIndex={hide ? -1 : 0}
          className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Choose dates
        </a>
      </div>
    </div>
  );
}
