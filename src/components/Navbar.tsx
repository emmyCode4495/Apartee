"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import CurrencyToggle from "@/components/CurrencyToggle";
import UserMenu from "@/components/auth/UserMenu";
import { useSaved } from "@/contexts/SavedContext";
import { useAuth } from "@/contexts/AuthContext";

const LINKS = [
  { href: "/listings?type=apartment", label: "Apartments" },
  { href: "/listings", label: "All stays" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { ids } = useSaved();
  const { user } = useAuth();
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
              savedActive
                ? "bg-surface text-foreground"
                : "text-muted hover:text-foreground"
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
          <UserMenu />
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
          className="border-t border-border bg-card px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/saved"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface"
            >
              Saved {ids.length > 0 ? `(${ids.length})` : ""}
            </Link>
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <CurrencyToggle />
            {user ? (
              <div className="space-y-2">
                <p className="px-1 text-sm font-medium">{user.fullName}</p>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-surface"
                >
                  Account
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-2xl border border-border py-2.5 text-center text-sm font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-2xl bg-primary py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
