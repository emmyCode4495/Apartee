/** Central SEO config — set NEXT_PUBLIC_SITE_URL in production (https://yourdomain.com) */

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Apatmentz";
export const SITE_TAGLINE =
  process.env.NEXT_PUBLIC_SITE_TAGLINE ||
  "Verified furnished apartments in Nigeria — full price upfront";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function propertyDescription(p: {
  title: string;
  location: string;
  city: string;
  country: string;
  type: string;
  bedrooms: number;
  guests: number;
  description?: string;
}): string {
  const beds =
    p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bedroom`;
  const base = `${p.title} — ${beds} ${p.type} in ${p.location}, ${p.city}, ${p.country}. Sleeps ${p.guests}. Book on ${SITE_NAME}.`;
  if (p.description) {
    return truncate(`${base} ${p.description}`, 160);
  }
  return truncate(base, 160);
}
