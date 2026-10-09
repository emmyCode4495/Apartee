"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type CurrencyCode,
  type CurrencyInfo,
  convertFromUsd,
  formatMoney,
  getCurrencyFromCountry,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  info: CurrencyInfo;
  loading: boolean;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountUsd: number, opts?: { compact?: boolean }) => string;
  convert: (amountUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<CurrencyInfo>(getCurrencyFromCountry(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const forced = process.env.NEXT_PUBLIC_FORCE_CURRENCY as CurrencyCode | undefined;
    if (forced === "NGN" || forced === "USD") {
      setInfo(getCurrencyFromCountry(forced === "NGN" ? "NG" : "US"));
      setLoading(false);
      return;
    }

    // Prefer stored preference
    const stored = typeof window !== "undefined" ? (localStorage.getItem("apartee_currency") ?? localStorage.getItem("neststay_currency")) : null;
    if (stored === "NGN" || stored === "USD") {
      setInfo(getCurrencyFromCountry(stored === "NGN" ? "NG" : "US"));
      setLoading(false);
      return;
    }

    // Detect via API (IP-based)
    fetch("/api/currency")
      .then((r) => r.json())
      .then((data: { country?: string; currency?: CurrencyCode }) => {
        if (data.currency === "NGN" || data.country === "NG") {
          setInfo(getCurrencyFromCountry("NG"));
        } else {
          setInfo(getCurrencyFromCountry(data.country || null));
        }
      })
      .catch(() => {
        setInfo(getCurrencyFromCountry(null));
      })
      .finally(() => setLoading(false));
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    const next = getCurrencyFromCountry(c === "NGN" ? "NG" : "US");
    setInfo(next);
    try {
      localStorage.setItem("apartee_currency", c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency: info.code,
      info,
      loading,
      setCurrency,
      format: (amountUsd, opts) => formatMoney(amountUsd, info.code, opts),
      convert: (amountUsd) => convertFromUsd(amountUsd, info.code),
    }),
    [info, loading, setCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
