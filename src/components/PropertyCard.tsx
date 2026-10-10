"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Users,
} from "lucide-react";
import type { Property } from "@/lib/types";
import Price from "@/components/Price";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { useSaved } from "@/contexts/SavedContext";

interface PropertyCardProps {
  property: Property;
  /** Query string (e.g. "?checkIn=..") so the property page opens pre-filled. */
  search?: string;
  priority?: boolean;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function PropertyCard({
  property,
  search = "",
  priority = false,
}: PropertyCardProps) {
  const href = `/property/${property.id}${search}`;
  const images = property.images.slice(0, 5);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(property.id);

  function go(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = scroller.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  const arrow =
    "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow transition hover:scale-105 md:flex md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100";

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-xl bg-surface">
        <div className="pointer-events-none absolute left-2 top-2 z-20">
          <AvailabilityBadge status={property.availabilityStatus} />
        </div>
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, i) => (
            <Link
              key={src}
              href={href}
              tabIndex={i === 0 ? 0 : -1}
              aria-label={i === 0 ? property.title : undefined}
              aria-hidden={i === 0 ? undefined : true}
              className="relative block aspect-[4/3] w-full shrink-0 snap-center"
            >
              <Image
                  unoptimized
                src={src}
                alt={i === 0 ? property.title : ""}
                fill
                priority={priority && i === 0}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </Link>
          ))}
        </div>

        {property.host.isSuperhost && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm">
            <span className="size-1.5 rounded-full bg-lit" aria-hidden />
            Superhost
          </span>
        )}

        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          onClick={() => toggle(property.id)}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
        >
          <Heart
            className={`size-4 transition ${
              saved ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {index > 0 && (
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={`${arrow} left-2`}>
            <ChevronLeft className="size-4" />
          </button>
        )}
        {index < images.length - 1 && (
          <button type="button" aria-label="Next photo" onClick={() => go(1)} className={`${arrow} right-2`}>
            <ChevronRight className="size-4" />
          </button>
        )}

        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1" aria-hidden>
            {images.map((_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/55"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[15px] font-semibold leading-snug tracking-normal">
            <Link href={href} className="line-clamp-1 hover:underline">
              {property.title}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star className="size-3.5 fill-lit text-lit" aria-hidden />
            <span className="tabular">{property.rating}</span>
          </span>
        </div>

        <p className="mt-0.5 line-clamp-1 text-sm text-muted">
          {cap(property.type)} in {property.location}
        </p>
        <div className="mt-2">
          <AvailabilityBadge
            status={property.availabilityStatus}
            availableFrom={property.availableFrom}
          />
        </div>

        <p className="mt-2 flex items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden />
            {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden />
            {property.baths} bath
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" aria-hidden />
            {property.guests}
          </span>
        </p>

        <p className="mt-2.5 text-[15px]">
          <span className="font-semibold">
            <Price usd={property.pricePerNight} />
          </span>
          <span className="text-muted"> a night</span>
        </p>
      </div>
    </article>
  );
}
