import { NextRequest, NextResponse } from "next/server";
import { getCurrencyFromCountry } from "@/lib/currency";

export async function GET(req: NextRequest) {
  // Prefer platform geo headers (Vercel, Cloudflare, etc.)
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    "";

  if (country) {
    const info = getCurrencyFromCountry(country);
    return NextResponse.json({
      country: country.toUpperCase(),
      currency: info.code,
      source: "header",
    });
  }

  // Fallback: free IP lookup (best-effort)
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
      const res = await fetch(`https://ipapi.co/${ip}/country_code/`, {
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const code = (await res.text()).trim();
        const info = getCurrencyFromCountry(code);
        return NextResponse.json({
          country: code,
          currency: info.code,
          source: "ipapi",
        });
      }
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    country: null,
    currency: "USD",
    source: "default",
  });
}
