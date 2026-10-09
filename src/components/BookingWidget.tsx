"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck } from "lucide-react";
import type { Property } from "@/data/properties";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import GuestStepper from "@/components/GuestStepper";
import Price from "@/components/Price";
import { useDismiss } from "@/lib/useDismiss";
import { formatShort, nightsBetween } from "@/lib/dates";

interface BookingWidgetProps {
  property: Property;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
}

type Open = "dates" | "guests" | null;

export default function BookingWidget({
  property,
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = 2,
}: BookingWidgetProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { format, currency } = useCurrency();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Open>(null);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(Math.min(defaultGuests, property.guests));

  useDismiss(wrapRef, open !== null, () => setOpen(null));

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const subtotal = nights * property.pricePerNight;
  const cleaningFee = nights > 0 ? 75 : 0;
  const serviceFee = nights > 0 ? Math.round(subtotal * 0.12) : 0;
  const total = subtotal + cleaningFee + serviceFee;

  function handleReserve() {
    if (!checkIn || !checkOut || nights < 1) return;
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    const bookingPath = `/booking/${property.id}?${params.toString()}`;
    if (!authLoading && !user) {
      router.push(`/login?next=${encodeURIComponent(bookingPath)}`);
      return;
    }
    router.push(bookingPath);
  }


  return (
    <div id="booking" className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <p>
          <span className="font-display text-2xl font-semibold">
            <Price usd={property.pricePerNight} />
          </span>
          <span className="text-muted"> a night</span>
        </p>
        <p className="flex items-center gap-1 text-sm">
          <Star className="size-3.5 fill-lit text-lit" aria-hidden />
          <span className="font-semibold tabular">{property.rating}</span>
          <span className="text-muted tabular">({property.reviewCount})</span>
        </p>
      </div>

      <div ref={wrapRef} className="relative">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-2 divide-x divide-border">
            <button
              type="button"
              onClick={() => setOpen(open === "dates" ? null : "dates")}
              aria-expanded={open === "dates"}
              className={`${cell} ${open === "dates" && !checkIn ? "bg-surface" : ""}`}
            >
              <span className="text-xs font-medium text-muted">Check-in</span>
              <span className={`text-sm tabular ${checkIn ? "font-semibold" : "text-muted/80"}`}>
                {checkIn ? formatShort(checkIn) : "Add date"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(open === "dates" ? null : "dates")}
              aria-expanded={open === "dates"}
              className={`${cell} ${open === "dates" && checkIn && !checkOut ? "bg-surface" : ""}`}
            >
              <span className="text-xs font-medium text-muted">Check-out</span>
              <span className={`text-sm tabular ${checkOut ? "font-semibold" : "text-muted/80"}`}>
                {checkOut ? formatShort(checkOut) : "Add date"}
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(open === "guests" ? null : "guests")}
            aria-expanded={open === "guests"}
            className={`${cell} w-full border-t border-border`}
          >
            <span className="text-xs font-medium text-muted">Guests</span>
            <span className="text-sm font-semibold tabular">
              {guests} guest{guests > 1 ? "s" : ""}
            </span>
          </button>
        </div>

        {open === "dates" && (
          <div
            role="dialog"
            aria-label="Choose dates"
            className="animate-pop @container absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-border bg-card p-4 shadow-lift"
          >
            <DateRangeCalendar
              months={1}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(a, b) => {
                setCheckIn(a);
                setCheckOut(b);
              }}
              onDone={() => setOpen(null)}
            />
          </div>
        )}

        {open === "guests" && (
          <div
            role="dialog"
            aria-label="Choose guests"
            className="animate-pop absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-border bg-card p-5 shadow-lift"
          >
            <GuestStepper value={guests} max={property.guests} onChange={setGuests} />
            <p className="mt-3 text-xs text-muted">
              This place sleeps up to {property.guests}.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleReserve}
        className="mt-4 h-13 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover"
      >
        {nights < 1 ? "Choose dates" : "Reserve"}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="size-3.5" aria-hidden />
        You won&apos;t be charged yet
      </p>

      {nights > 0 && (
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
      )}
    </div>
  );
}
