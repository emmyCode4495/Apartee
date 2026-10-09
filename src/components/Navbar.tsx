"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import CurrencyToggle from "@/components/CurrencyToggle";
import { useSaved } from "@/contexts/SavedContext";

const LINKS = [
  { href: "/listings?type=apartment", label: "Apartments" },
  { href: "/listings", label: "All stays" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { ids } = useSaved();
  const savedActive = pathname === "/saved";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CurrencyToggle />
          <Link
            href="/saved"
            aria-current={savedActive ? "page" : undefined}
            className={`relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition hover:bg-surface ${
              savedActive ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <Heart className="size-4" />
            Saved
            {ids.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lit px-1.5 text-xs font-semibold text-foreground tabular">
                {ids.length}
              </span>
            )}
          </Link>
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-surface md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="animate-pop border-t border-border bg-card px-4 pb-5 pt-3 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {[...LINKS, { href: "/saved", label: ids.length ? `Saved (${ids.length})` : "Saved" }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium transition hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-border px-3 pt-4">
            <span className="text-sm text-muted">Currency</span>
            <CurrencyToggle />
          </div>
        </div>
      )}
    </header>
  );
}
