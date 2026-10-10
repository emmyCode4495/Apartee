import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import ListingsFilters from "@/components/ListingsFilters";
import { getProperties, filterPropertiesList } from "@/lib/data";
import { formatRange } from "@/lib/dates";

export const metadata = { title: "Find an apartment" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const location = params.location ?? "";
  const type = params.type || "all";
  const guests = params.guests ? Number(params.guests) : undefined;
  const beds = params.beds ? Number(params.beds) : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort ?? "recommended";
  const checkIn = params.checkIn ?? "";
  const checkOut = params.checkOut ?? "";

  const all = await getProperties({ publishedOnly: true });
  const suggestions = Array.from(new Set(all.map((p) => p.location)));

  let results = filterPropertiesList(all, {
    location: location || undefined,
    type,
    guests,
    minPrice,
    maxPrice,
    beds,
  }).sort((a, b) => {
    if (sort === "price-asc") return a.pricePerNight - b.pricePerNight;
    if (sort === "price-desc") return b.pricePerNight - a.pricePerNight;
    if (sort === "rating") return b.rating - a.rating;
    const apt = Number(b.type === "apartment") - Number(a.type === "apartment");
    return apt || b.rating - a.rating;
  });

  const [singular, plural] = NOUNS[type] || NOUNS.all;
  const noun = results.length === 1 ? singular : plural;
  const dateLabel =
    checkIn && checkOut ? formatRange(checkIn, checkOut) : null;

  const cardSearch = new URLSearchParams();
  if (checkIn) cardSearch.set("checkIn", checkIn);
  if (checkOut) cardSearch.set("checkOut", checkOut);
  if (guests) cardSearch.set("guests", String(guests));
  const searchQs = cardSearch.toString() ? `?${cardSearch.toString()}` : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <SearchBar
          variant="compact"
          defaultLocation={location}
          defaultGuests={guests ?? 2}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          suggestions={suggestions}
        />
      </div>

      <Suspense fallback={null}>
        <ListingsFilters currentType={type} />
      </Suspense>

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {results.length} {noun}
          {location ? ` in ${location}` : ""}
        </h1>
        {dateLabel && (
          <p className="mt-1 text-sm text-muted">{dateLabel}</p>
        )}
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <SearchX className="size-10 text-muted" />
          <p className="mt-4 font-semibold">No stays match these filters</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {all.length === 0
              ? "No published listings yet. Publish properties from the admin dashboard."
              : "Try clearing filters or searching another city."}
          </p>
          <Link
            href="/listings"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <PropertyCard key={p.id} property={p} search={searchQs} />
          ))}
        </div>
      )}
    </div>
  );
}
