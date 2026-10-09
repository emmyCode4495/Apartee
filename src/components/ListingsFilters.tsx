"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { USD_TO_NGN } from "@/lib/currency";
import { useCurrency } from "@/contexts/CurrencyContext";

const TYPES = [
  { value: "all", label: "All stays" },
  { value: "apartment", label: "Apartments" },
  { value: "hotel", label: "Hotels" },
  { value: "villa", label: "Villas" },
  { value: "cabin", label: "Cabins" },
  { value: "cottage", label: "Cottages" },
];

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const BEDS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const GUESTS = [
  { value: "", label: "Any" },
  { value: "2", label: "2+" },
  { value: "4", label: "4+" },
  { value: "6", label: "6+" },
  { value: "8", label: "8+" },
];

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 font-sans text-sm font-semibold tracking-normal">{label}</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-w-14 rounded-full border px-4 py-2 text-sm font-medium transition ${
              value === o.value
                ? "border-foreground bg-foreground text-white"
                : "border-border hover:border-foreground/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ListingsFilters({ currentType }: { currentType: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currency, info } = useCurrency();
  const rate = currency === "NGN" ? USD_TO_NGN : 1;
  const [pending, startTransition] = useTransition();

  const [sheet, setSheet] = useState(false);
  const [beds, setBeds] = useState("");
  const [guests, setGuests] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const activeCount = ["beds", "guests", "minPrice", "maxPrice"].filter((k) =>
    searchParams.get(k)
  ).length;

  function push(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v || v === "all") params.delete(k);
      else params.set(k, v);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function openSheet() {
    setBeds(searchParams.get("beds") ?? "");
    setGuests(searchParams.get("guests") ?? "");
    const minUsd = Number(searchParams.get("minPrice"));
    const maxUsd = Number(searchParams.get("maxPrice"));
    setMin(minUsd ? String(Math.round(minUsd * rate)) : "");
    setMax(maxUsd ? String(Math.round(maxUsd * rate)) : "");
    setSheet(true);
  }

  function applySheet() {
    const toUsd = (v: string) => (v && Number(v) > 0 ? String(Math.round(Number(v) / rate)) : null);
    push({ beds, guests, minPrice: toUsd(min), maxPrice: toUsd(max) });
    setSheet(false);
  }

  function clearSheet() {
    setBeds("");
    setGuests("");
    setMin("");
    setMax("");
  }

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  const input =
    "w-full rounded-lg border border-border bg-card py-3 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

  return (
    <>
      {pending && (
        <div className="fixed inset-x-0 top-16 z-40 h-0.5 overflow-hidden bg-primary/15" role="progressbar" aria-label="Updating results">
          <div className="animate-progress h-full w-1/2 bg-primary" />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          role="group"
          aria-label="Property type"
        >
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={currentType === t.value}
              onClick={() => push({ type: t.value })}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                currentType === t.value
                  ? "border-foreground bg-foreground text-white"
                  : "border-border bg-card hover:border-foreground/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openSheet}
            className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:border-foreground/50"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-lit text-xs font-semibold tabular">
                {activeCount}
              </span>
            )}
          </button>
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={searchParams.get("sort") ?? "recommended"}
            onChange={(e) => push({ sort: e.target.value === "recommended" ? null : e.target.value })}
            className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium outline-none transition hover:border-foreground/50 focus:border-primary"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-title"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
        >
          <div className="absolute inset-0 bg-foreground/45" onClick={() => setSheet(false)} aria-hidden />
          <div className="animate-sheet shadow-lift relative z-10 flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-card sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 id="filters-title" className="text-lg font-semibold">
                Filters
              </h2>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close filters"
                onClick={() => setSheet(false)}
                className="flex size-9 items-center justify-center rounded-full transition hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-8 overflow-y-auto px-6 py-6">
              <ChipGroup label="Bedrooms" options={BEDS} value={beds} onChange={setBeds} />
              <ChipGroup label="Guests" options={GUESTS} value={guests} onChange={setGuests} />
              <div>
                <h3 className="mb-3 font-sans text-sm font-semibold tracking-normal">
                  Price per night ({currency})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "min", label: "Minimum", value: min, set: setMin },
                    { id: "max", label: "Maximum", value: max, set: setMax },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={`price-${f.id}`} className="mb-1.5 block text-xs font-medium text-muted">
                        {f.label}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                          {info.symbol}
                        </span>
                        <input
                          id={`price-${f.id}`}
                          inputMode="numeric"
                          value={f.value}
                          onChange={(e) => f.set(e.target.value.replace(/\D/g, ""))}
                          placeholder={f.id === "min" ? "0" : "Any"}
                          className={input}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={clearSheet}
                className="text-sm font-semibold underline underline-offset-4 transition hover:text-primary"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={applySheet}
                className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
