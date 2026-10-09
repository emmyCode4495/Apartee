"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, X, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import CurrencyToggle from "@/components/CurrencyToggle";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";
import { useSaved } from "@/contexts/SavedContext";
import { useAuth } from "@/contexts/AuthContext";

const LINKS = [
  { href: "/listings?type=apartment", label: "Apartments" },
  { href: "/listings", label: "All stays" },
];

/**
 * Mobile nav uses native <details>/<summary> so it works even when
 * React hydration fails on a real phone (logo links still worked before).
 */
export default function Navbar() {
  const pathname = usePathname();
  const { ids } = useSaved();
  const { user } = useAuth();
  const savedActive = pathname === "/saved";
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Close native details when the route changes
  useEffect(() => {
    const el = detailsRef.current;
    if (el) el.open = false;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <Logo priority />
        </div>

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
          <ThemeToggle />
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

        {/* Native disclosure — no React state required for open/close */}
        <details ref={detailsRef} className="relative md:hidden">
          <summary
            className="flex h-12 w-12 list-none items-center justify-center rounded-full text-foreground [&::-webkit-details-marker]:hidden"
            aria-label="Open menu"
            style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
          >
            <Menu className="size-6 open-hide" />
            <X className="size-6 open-show" />
          </summary>

          <div className="absolute right-0 top-full z-[120] mt-1 w-[min(100vw-2rem,20rem)] rounded-2xl border border-border bg-card p-3 shadow-lift">
            <nav className="flex flex-col gap-0.5">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-3 text-sm font-medium active:bg-surface"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/saved"
                className="rounded-xl px-3 py-3 text-sm font-medium active:bg-surface"
              >
                Saved {ids.length > 0 ? `(${ids.length})` : ""}
              </Link>
            </nav>
            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-muted">Appearance</span>
                <ThemeToggle />
              </div>
              <CurrencyToggle />
              {user ? (
                <Link
                  href="/account"
                  className="rounded-xl px-3 py-2.5 text-sm font-medium active:bg-surface"
                >
                  Account — {user.fullName}
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-2xl border border-border py-3 text-center text-sm font-semibold"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
