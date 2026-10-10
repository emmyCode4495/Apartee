import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import Facade from "@/components/Facade";
import FloorPlan from "@/components/FloorPlan";
import { getProperties } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sizes = [
  { beds: 1 as const, title: "1 bedroom", note: "Solo trips and couples" },
  {
    beds: 2 as const,
    title: "2 bedrooms",
    note: "Friends, colleagues, small families",
  },
  {
    beds: 3 as const,
    title: "3+ bedrooms",
    note: "Larger groups and longer stays",
  },
];

const steps = [
  {
    title: "Choose your dates",
    body: "Search by city and see the total price for your stay, fees included, before you commit.",
  },
  {
    title: "Reserve in two steps",
    body: "Add your details and payment. Your reservation is recorded straight away.",
  },
  {
    title: "Settle in",
    body: "Your host handles check-in details once your booking is confirmed.",
  },
];

export default async function Home() {
  const properties = await getProperties({ publishedOnly: true });

  const ranked = [...properties].sort((a, b) => {
    const apt = Number(b.type === "apartment") - Number(a.type === "apartment");
    return apt || b.rating - a.rating;
  });

  const suggestions = Array.from(new Set(properties.map((p) => p.location)));

  const cities = Object.values(
    properties.reduce<
      Record<string, { city: string; image: string; count: number }>
    >((acc, p) => {
      const key = p.city;
      if (!p.images[0]) return acc;
      acc[key] ??= { city: p.city, image: p.images[0], count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).slice(0, 4);

  const featured = ranked.slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="bg-facade pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <h1 className="text-balance text-[2.5rem] font-semibold leading-[1.05] sm:text-6xl">
              Modern apartments, booked in minutes.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              From Lagos to Abuja — refined, furnished apartments with the full
              price in naira, shown before you book.
            </p>

            <div className="mt-9 max-w-2xl">
              <SearchBar suggestions={suggestions} />
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                Secure booking
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" aria-hidden />
                Every listing reviewed
              </li>
            </ul>
          </div>

          <div className="hidden lg:block">
            {ranked.length > 0 ? (
              <Facade properties={ranked} />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-sm text-muted">
                Listings will appear here once published in admin
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Featured stays</h2>
            <p className="mt-1.5 text-muted">Live from your published listings</p>
          </div>
          <Link
            href="/listings"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            See all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted">
            No published properties yet. Add and publish stays in the admin
            dashboard.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 2} />
            ))}
          </div>
        )}

        <Link
          href="/listings"
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:hidden"
        >
          See all
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Find by size</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {sizes.map((s) => (
              <Link
                key={s.beds}
                href={`/listings?beds=${s.beds}`}
                className="group flex items-center gap-5 rounded-xl border border-border p-5 transition hover:border-foreground"
              >
                <FloorPlan
                  bedrooms={s.beds}
                  className="h-16 w-24 shrink-0 text-foreground transition group-hover:text-primary"
                />
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{s.note}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {cities.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Browse by city</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cities.map((c) => (
              <Link
                key={c.city}
                href={`/listings?location=${encodeURIComponent(c.city)}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  className="img-zoom object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  unoptimized={c.image.includes("supabase.co")}
                />
                <span
                  className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent"
                  aria-hidden
                />
                <span className="absolute inset-x-4 bottom-4 text-white">
                  <span className="block font-display text-xl font-semibold">
                    {c.city}
                  </span>
                  <span className="text-sm text-white/80">
                    {c.count} {c.count === 1 ? "stay" : "stays"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold sm:text-3xl">How booking works</h2>
        <ol className="mt-8 grid gap-10 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-foreground pt-5">
              <span className="font-display text-sm font-semibold text-muted tabular">
                Step {i + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
