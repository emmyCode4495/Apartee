import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import ListingsFilters from "@/components/ListingsFilters";
import {
  filterProperties,
  properties,
  type PropertyType,
} from "@/data/properties";
import { formatRange } from "@/lib/dates";

export const metadata = { title: "Find an apartment" };

interface PageProps {
  searchParams: Promise<{
    location?: string;
    type?: string;
    guests?: string;
    beds?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
}

const NOUNS: Record<string, [string, string]> = {
  all: ["stay", "stays"],
  apartment: ["apartment", "apartments"],
  hotel: ["hotel", "hotels"],
  villa: ["villa", "villas"],
  cabin: ["cabin", "cabins"],
  cottage: ["cottage", "cottages"],
};

const suggestions = Array.from(new Set(properties.map((p) => p.location)));

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const location = params.location ?? "";
  const type = (params.type as PropertyType | "all") || "all";
  const guests = params.guests ? Number(params.guests) : undefined;
  const beds = params.beds ? Number(params.beds) : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort ?? "recommended";
  const checkIn = params.checkIn ?? "";
  const checkOut = params.checkOut ?? "";

  const results = filterProperties({
    location: location || undefined,
    type,
    guests,
    minPrice,
    maxPrice,
  })
    .filter((p) => !beds || p.bedrooms >= beds)
    .sort((a, b) => {
      if (sort === "price-asc") return a.pricePerNight - b.pricePerNight;
      if (sort === "price-desc") return b.pricePerNight - a.pricePerNight;
      if (sort === "rating") return b.rating - a.rating;
      // Recommended: apartments first when browsing everything, then by rating.
      const apt = Number(b.type === "apartment") - Number(a.type === "apartment");
      return (type === "all" ? apt : 0) || b.rating - a.rating;
    });

  // Carry dates and guests through to the property page.
  const carry = new URLSearchParams();
  if (checkIn) carry.set("checkIn", checkIn);
  if (checkOut) carry.set("checkOut", checkOut);
  if (guests) carry.set("guests", String(guests));
  const search = carry.toString() ? `?${carry.toString()}` : "";

  const [one, many] = NOUNS[type] ?? NOUNS.all;
  const noun = results.length === 1 ? one : many;
  const hasFilters = !!(location || beds || guests || minPrice || maxPrice || type !== "all");
  const context = [
    checkIn && checkOut ? formatRange(checkIn, checkOut) : "",
    guests ? `${guests}+ guests` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <SearchBar
            variant="compact"
            suggestions={suggestions}
            defaultLocation={location}
            defaultGuests={guests ?? 2}
            defaultCheckIn={checkIn}
            defaultCheckOut={checkOut}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="skeleton h-10 w-full rounded-full" />}>
          <ListingsFilters currentType={type} />
        </Suspense>

        <div className="mb-8 mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {results.length} {noun}
              {location ? ` in ${location}` : " available"}
            </h1>
            {context && <p className="mt-1.5 text-muted tabular">{context}</p>}
          </div>
          {hasFilters && (
            <Link
              href="/listings"
              className="text-sm font-semibold underline underline-offset-4 transition hover:text-primary"
            >
              Clear all filters
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface">
              <SearchX className="size-6 text-muted" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold">No {many} match those filters</h2>
            <p className="mt-2 text-sm text-muted">
              Try a different city, widen your price range, or remove a filter.
            </p>
            <Link
              href="/listings"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((p, i) => (
              <PropertyCard key={p.id} property={p} search={search} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
