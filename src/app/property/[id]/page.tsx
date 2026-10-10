import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  ChevronLeft,
  MapPin,
  BadgeCheck,
  Award,
  CalendarX2,
  ExternalLink,
} from "lucide-react";
import { getPropertyById } from "@/lib/data";
import BookingWidget from "@/components/BookingWidget";
import Gallery from "@/components/Gallery";
import ExpandableText from "@/components/ExpandableText";
import AmenityGrid from "@/components/AmenityGrid";
import MobileReserveBar from "@/components/MobileReserveBar";
import AvailabilityBadge from "@/components/AvailabilityBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">) {
  const { id } = await params;
  const property = await getPropertyById(id);
  return { title: property ? property.title : "Stay not found" };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function PropertyPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const property = await getPropertyById(id);

  if (!property) notFound();

  const { lat, lng } = property.coordinates;
  const hasMap = lat !== 0 || lng !== 0;

  const facts = [
    { value: property.guests, label: "Guests" },
    { value: property.bedrooms === 0 ? "Studio" : property.bedrooms, label: "Bedrooms" },
    { value: property.beds, label: "Beds" },
    { value: property.baths, label: "Bathrooms" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-16">
      <Link
        href="/listings"
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All stays
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold sm:text-4xl">{property.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Star className="size-4 fill-lit text-lit" aria-hidden />
            <span className="font-semibold tabular">{property.rating}</span>
            <span className="text-muted tabular">({property.reviewCount} reviews)</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <MapPin className="size-4" aria-hidden />
            {property.location}
          </span>
          {property.host.isSuperhost && (
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="size-4 text-primary" aria-hidden />
              Superhost
            </span>
          )}
        </div>
      </div>

      <Gallery images={property.images} title={property.title} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_390px]">
        <div className="min-w-0">
          {/* At a glance */}
          <section aria-label="At a glance">
            <p className="mb-4 text-lg font-semibold font-display">
              {cap(property.type)} hosted by {property.host.name}
            </p>
            <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-4 sm:divide-x sm:divide-border">
              {facts.map((f, i) => (
                <div
                  key={f.label}
                  className={`px-5 py-4 ${i % 2 === 1 ? "border-l border-border sm:border-l-0" : ""} ${i > 1 ? "border-t border-border sm:border-t-0" : ""}`}
                >
                  <dd className="font-display text-2xl font-semibold tabular">{f.value}</dd>
                  <dt className="text-sm text-muted">{f.label}</dt>
                </div>
              ))}
            </dl>
          </section>

          {/* Host */}
          <section className="mt-10 flex items-center gap-4 border-t border-border pt-10">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
              {property.host.avatar ? (
                <SafeImage
                  src={property.host.avatar}
                  alt={property.host.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-lg font-semibold text-muted">
                  {(property.host.name || "H").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Hosted by {property.host.name}</h2>
              <p className="text-sm text-muted">
                {property.host.isSuperhost ? "Superhost" : "Host"}
                {property.host.joined ? `, joined ${property.host.joined}` : ""}
              </p>
            </div>
          </section>

          {/* Highlights */}
          {property.highlights.length > 0 && (
            <section className="mt-10 border-t border-border pt-10">
              <h2 className="mb-5 text-xl font-semibold">Why guests book this place</h2>
              <ul className="space-y-4">
                {property.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <BadgeCheck className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium">{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* About */}
          <section className="mt-10 border-t border-border pt-10">
            <h2 className="mb-4 text-xl font-semibold">About this place</h2>
            <ExpandableText text={property.description} />
          </section>

          {/* Amenities */}
          <section className="mt-10 border-t border-border pt-10">
            <h2 className="mb-6 text-xl font-semibold">What this place offers</h2>
            <AmenityGrid amenities={property.amenities} />
          </section>

          {/* Location */}
          <section className="mt-10 border-t border-border pt-10">
            <h2 className="mb-4 text-xl font-semibold">Where you&apos;ll be</h2>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{property.location}</p>
                  <p className="text-sm text-muted">
                    {property.city}, {property.country}
                  </p>
                </div>
              </div>
              {hasMap && (
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold transition hover:border-foreground"
                >
                  Open in Maps
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              )}
            </div>
          </section>

          {/* Cancellation */}
          <section className="mt-10 border-t border-border pt-10">
            <h2 className="mb-4 text-xl font-semibold">Before you book</h2>
            <div className="flex items-start gap-3 text-[15px]">
              <CalendarX2 className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <p className="max-w-prose leading-relaxed text-muted">
                Many stays offer free cancellation up to 48 hours before
                check-in. The cleaning and service fees are shown in your
                price breakdown before you pay.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            property={property}
            defaultCheckIn={sp.checkIn}
            defaultCheckOut={sp.checkOut}
            defaultGuests={sp.guests ? Number(sp.guests) : 2}
          />
        </div>
      </div>

      <MobileReserveBar pricePerNight={property.pricePerNight} />
    </div>
  );
}
