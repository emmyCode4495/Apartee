/** Base prices are stored in USD. Display currency: NGN in Nigeria, USD elsewhere. */

export type CurrencyCode = "USD" | "NGN";

/** Approximate USD → NGN rate (update periodically or via API) */
export const USD_TO_NGN = 1600;

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  countryHint: "NG" | "OTHER";
}

export function getCurrencyFromCountry(countryCode?: string | null): CurrencyInfo {
  const cc = (countryCode || "").toUpperCase();
  if (cc === "NG" || cc === "NGA" || cc === "NIGERIA") {
    return { code: "NGN", symbol: "₦", locale: "en-NG", countryHint: "NG" };
  }
  return { code: "USD", symbol: "$", locale: "en-US", countryHint: "OTHER" };
}

/** Convert USD amount to display currency */
export function convertFromUsd(amountUsd: number, currency: CurrencyCode): number {
  if (currency === "NGN") return Math.round(amountUsd * USD_TO_NGN);
  return Math.round(amountUsd * 100) / 100;
}

export function formatMoney(
  amountUsd: number,
  currency: CurrencyCode,
  options?: { compact?: boolean }
): string {
  const value = convertFromUsd(amountUsd, currency);
  const info = currency === "NGN"
    ? { code: "NGN" as const, locale: "en-NG" }
    : { code: "USD" as const, locale: "en-US" };

  if (options?.compact && value >= 1000) {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat(info.locale, {
    style: "currency",
    currency: info.code,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(value);
}

export function formatMoneyRaw(
  amount: number,
  currency: CurrencyCode
): string {
  const locale = currency === "NGN" ? "en-NG" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}
