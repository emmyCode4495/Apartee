import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_ADMIN_BASE = "/ops-k7xm2";

function getAdminBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim() || DEFAULT_ADMIN_BASE;
  let base = raw.startsWith("/") ? raw : `/${raw}`;
  if (base === "/admin" || base.startsWith("/admin/")) {
    base = DEFAULT_ADMIN_BASE;
  }
  return base.replace(/\/$/, "") || DEFAULT_ADMIN_BASE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminBase = getAdminBase();

  // Block the obvious /admin URL — look like a normal missing page
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/__admin_blocked", request.url));
  }

  // Secret base path is rewritten to internal /admin/*
  if (pathname === adminBase || pathname.startsWith(`${adminBase}/`)) {
    const rest =
      pathname === adminBase ? "" : pathname.slice(adminBase.length);
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/admin${rest}` : "/admin";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets.
     * Needed so a custom ADMIN_BASE_PATH (any string) is rewritten.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
