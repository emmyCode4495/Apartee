/** Base prices are stored in USD internally. Admins enter NGN; site converts for display. */

export type CurrencyCode = "USD" | "NGN";

/** Approximate NGN per 1 USD (update periodically or via API) */
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

/** Convert stored USD amount → display currency */
export function convertFromUsd(amountUsd: number, currency: CurrencyCode): number {
  if (currency === "NGN") return Math.round(amountUsd * USD_TO_NGN);
  return Math.round(amountUsd * 100) / 100;
}

/** Convert admin-entered NGN → USD for storage */
export function convertNgnToUsd(amountNgn: number): number {
  if (!amountNgn || amountNgn <= 0) return 0;
  return Math.round((amountNgn / USD_TO_NGN) * 100) / 100;
}

/** Convert stored USD → NGN for admin form fields */
export function convertUsdToNgn(amountUsd: number): number {
  return Math.round(amountUsd * USD_TO_NGN);
}

export function formatMoney(
  amountUsd: number,
  currency: CurrencyCode,
  options?: { compact?: boolean }
): string {
  const value = convertFromUsd(amountUsd, currency);
  return formatMoneyRaw(value, currency, options);
}

/** Format an amount already in the target currency (not USD). */
export function formatMoneyRaw(
  amount: number,
  currency: CurrencyCode,
  options?: { compact?: boolean }
): string {
  const info =
    currency === "NGN"
      ? { code: "NGN" as const, locale: "en-NG" }
      : { code: "USD" as const, locale: "en-US" };

  if (options?.compact && amount >= 1000) {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat(info.locale, {
    style: "currency",
    currency: info.code,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}

export function formatNgn(amountNgn: number): string {
  return formatMoneyRaw(amountNgn, "NGN");
}
