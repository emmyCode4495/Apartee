"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

const OPTIONS = [
  { code: "USD", label: "$ USD" },
  { code: "NGN", label: "₦ NGN" },
] as const;

export default function CurrencyToggle() {
  const { currency, setCurrency, loading } = useCurrency();

  if (loading) {
    return <div className="skeleton h-9 w-[132px] rounded-full" />;
  }

  return (
    <div
      role="group"
      aria-label="Display currency"
      className="flex items-center rounded-full bg-surface p-0.5 text-xs font-semibold"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          aria-pressed={currency === o.code}
          onClick={() => setCurrency(o.code)}
          className={`rounded-full px-3 py-1.5 transition ${
            currency === o.code
              ? "bg-foreground text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
