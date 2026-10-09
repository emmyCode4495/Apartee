"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminBasePath } from "@/lib/admin-path";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminBase = getAdminBasePath();
  const isAdmin =
    pathname === adminBase ||
    pathname?.startsWith(`${adminBase}/`) ||
    pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
