"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminPath, getAdminBasePath } from "@/lib/admin-path";
import { LogoMark } from "@/components/Logo";

const links = [
  { href: adminPath(), label: "Dashboard", icon: LayoutDashboard },
  { href: adminPath("/properties"), label: "Properties", icon: Building2 },
  { href: adminPath("/bookings"), label: "Bookings", icon: CalendarCheck },
  { href: adminPath("/users"), label: "Users", icon: Users },
  { href: adminPath("/settings"), label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    // Clear demo admin session
    try {
      sessionStorage.removeItem("apartee_staff");
    } catch {
      /* ignore */
    }
    router.push(adminPath("/login"));
    router.refresh();
  }

  const Nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <LogoMark className="size-8" />
        <div>
          <p className="font-display text-sm font-semibold">Apatmentz</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === adminPath()
              ? pathname === adminPath() || pathname === getAdminBasePath()
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          View site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {Nav}
      </aside>
    </>
  );
}
