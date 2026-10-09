/**
 * Admin panel is not served at /admin publicly.
 * Set NEXT_PUBLIC_ADMIN_BASE_PATH to a hard-to-guess path (e.g. /ops-k7xm2).
 * Middleware rewrites that path → /admin internally and returns 404 for /admin.
 */
export const DEFAULT_ADMIN_BASE = "/ops-k7xm2";

export function getAdminBasePath(): string {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim() || DEFAULT_ADMIN_BASE;
  const base = raw.startsWith("/") ? raw : `/${raw}`;
  // Never allow the public /admin string as the external path
  if (base === "/admin" || base.startsWith("/admin/")) {
    return DEFAULT_ADMIN_BASE;
  }
  return base.replace(/\/$/, "") || DEFAULT_ADMIN_BASE;
}

/** Build a public admin URL, e.g. adminPath('/properties') → '/ops-…/properties' */
export function adminPath(subpath = ""): string {
  const base = getAdminBasePath();
  if (!subpath || subpath === "/") return base;
  const path = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `${base}${path}`;
}
