"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

/**
 * Formats a USD amount in the visitor's currency. While the currency is still
 * being detected it shows a placeholder, so prices never flash in the wrong currency.
 */
export default function Price({
  usd,
  compact,
}: {
  usd: number;
  compact?: boolean;
}) {
  const { format, loading } = useCurrency();
  if (loading) {
    return (
      <span
        className="skeleton inline-block h-[0.9em] w-16 rounded align-middle"
        aria-label="Loading price"
      />
    );
  }
  return <span className="tabular">{format(usd, { compact })}</span>;
}
