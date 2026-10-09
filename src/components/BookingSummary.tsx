"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { Property } from "@/lib/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatLong } from "@/lib/dates";

interface Props {
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export default function BookingSummary({
  property,
  checkIn,
  checkOut,
  guests,
  nights,
  subtotal,
  cleaningFee,
  serviceFee,
  total,
}: Props) {
  const { format, currency } = useCurrency();

  return (
    <aside aria-label="Booking summary" className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex gap-4">
          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-surface">
            <Image src={property.images[0]} alt="" fill className="object-cover" sizes="112px" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted">
              {property.type.charAt(0).toUpperCase() + property.type.slice(1)} in {property.city}
            </p>
            <h2 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug">
              {property.title}
            </h2>
            <p className="mt-1.5 flex items-center gap-1 text-xs">
              <Star className="size-3 fill-lit text-lit" aria-hidden />
              <span className="font-semibold tabular">{property.rating}</span>
              <span className="text-muted tabular">({property.reviewCount})</span>
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Dates</dt>
            <dd className="text-right font-medium tabular">
              {checkIn && checkOut ? `${formatLong(checkIn)} to ${formatLong(checkOut)}` : "Not chosen"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Guests</dt>
            <dd className="font-medium tabular">{guests}</dd>
          </div>
        </dl>

        <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted tabular">
              {format(property.pricePerNight)} × {nights} night{nights > 1 ? "s" : ""}
            </dt>
            <dd className="tabular">{format(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Cleaning fee</dt>
            <dd className="tabular">{format(cleaningFee)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Service fee</dt>
            <dd className="tabular">{format(serviceFee)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-4 text-base font-semibold">
            <dt>Total ({currency})</dt>
            <dd className="tabular">{format(total)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
