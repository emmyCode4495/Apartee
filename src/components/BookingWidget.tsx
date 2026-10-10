"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck } from "lucide-react";
import type { Property } from "@/lib/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import Price from "@/components/Price";
import { nightsBetween } from "@/lib/dates";

interface BookingWidgetProps {
  property: Property;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
}

/** Today as YYYY-MM-DD in local time */
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Uses native <input type="date"> and type="number" so check-in / check-out /
 * guests work on real phones even if custom modals fail.
 */
export default function BookingWidget({
  property,
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = 2,
}: BookingWidgetProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { format, currency } = useCurrency();
  const minDate = todayISO();

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(
    Math.min(Math.max(1, defaultGuests), property.guests)
  );

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const subtotal = nights * property.pricePerNight;
  const cleaningFee = nights > 0 ? 75 : 0;
  const serviceFee = nights > 0 ? Math.round(subtotal * 0.12) : 0;
  const total = subtotal + cleaningFee + serviceFee;

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-primary";

  function onCheckIn(v: string) {
    setCheckIn(v);
    if (checkOut && v && checkOut <= v) setCheckOut("");
  }

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
    <div
      id="booking"
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      {property.availabilityStatus === "booked" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Currently booked
          {property.availableFrom
            ? ` — free from ${property.availableFrom}`
            : ""}. You can still request dates from that day onward.
        </div>
      )}

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

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Check-in
            </span>
            <input
              type="date"
              value={checkIn}
              min={minDate}
              onChange={(e) => onCheckIn(e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Check-out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn || minDate}
              onChange={(e) => setCheckOut(e.target.value)}
              className={field}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Guests (max {property.guests})
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={property.guests}
            value={guests}
            onChange={(e) => {
              const n = Number(e.target.value) || 1;
              setGuests(Math.min(Math.max(1, n), property.guests));
            }}
            className={field}
          />
        </label>
      </div>

      {/* Native form GET so Reserve still navigates if client JS is flaky */}
      <form
        action={user || authLoading ? `/booking/${property.id}` : `/login`}
        method="get"
        className="mt-4"
        onSubmit={(e) => {
          if (nights < 1) {
            e.preventDefault();
            return;
          }
          if (!authLoading && !user) {
            e.preventDefault();
            handleReserve();
          }
        }}
      >
        <input type="hidden" name="checkIn" value={checkIn} />
        <input type="hidden" name="checkOut" value={checkOut} />
        <input type="hidden" name="guests" value={String(guests)} />
        {!user && !authLoading && (
          <input
            type="hidden"
            name="next"
            value={`/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
          />
        )}
        <button
          type="submit"
          disabled={nights < 1}
          className="h-13 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55"
        >
          {nights < 1 ? "Select dates to reserve" : "Reserve"}
        </button>
      </form>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="size-3.5" aria-hidden />
        You won&apos;t be charged yet
      </p>

      {nights > 0 && (
        <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted tabular">
              {format(property.pricePerNight)} × {nights} night
              {nights > 1 ? "s" : ""}
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
