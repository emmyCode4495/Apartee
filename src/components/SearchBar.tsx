"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, CalendarDays, Users, X } from "lucide-react";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import GuestStepper from "@/components/GuestStepper";
import { useDismiss } from "@/lib/useDismiss";
import { formatRange, formatShort } from "@/lib/dates";

type Field = "where" | "dates" | "guests" | null;

interface SearchBarProps {
  variant?: "hero" | "compact";
  defaultLocation?: string;
  defaultGuests?: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  /** Destination suggestions, e.g. "Shibuya, Tokyo" */
  suggestions?: string[];
}

export default function SearchBar({
  variant = "hero",
  defaultLocation = "",
  defaultGuests = 2,
  defaultCheckIn = "",
  defaultCheckOut = "",
  suggestions = [],
}: SearchBarProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState<Field>(null);
  const [location, setLocation] = useState(defaultLocation);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);
  const [active, setActive] = useState(-1);

  useDismiss(formRef, open !== null, () => setOpen(null));

  const query = location.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => s.toLowerCase().includes(query))
    .slice(0, 6);
  const showList = open === "where" && matches.length > 0;
  const compact = variant === "compact";

  function chooseLocation(value: string) {
    setLocation(value);
    setActive(-1);
    setOpen("dates"); // guided flow: where, then dates, then guests
  }

  function onWhereKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? matches.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      chooseLocation(matches[active]);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Keep filters already applied on the listings page (type, bedrooms, sort...).
    const params = compact
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    const set = (k: string, v: string) =>
      v ? params.set(k, v) : params.delete(k);
    set("location", location.trim());
    set("checkIn", checkIn);
    set("checkOut", checkOut);
    set("guests", String(guests));
    setOpen(null);
    router.push(`/listings?${params.toString()}`);
  }

  const pad = compact ? "px-4 py-2.5" : "px-4 py-3";
  const field = `flex w-full flex-col gap-0.5 rounded-xl ${pad} text-left transition hover:bg-surface`;
  const label = "text-xs font-medium text-muted";

  return (
    <form
      ref={formRef}
      onSubmit={handleSearch}
      role="search"
      aria-label="Search apartments"
      className={`relative rounded-2xl border border-border bg-card p-1.5 ${
        compact ? "shadow-soft" : "shadow-lift"
      }`}
    >
      <div
        className={
          compact
            ? "grid gap-1 md:grid-cols-[1.4fr_1.2fr_0.8fr_auto] md:items-center"
            : "grid gap-1 sm:grid-cols-2"
        }
      >
        {/* Where */}
        <div className={`${field} ${open === "where" ? "bg-surface" : ""} ${compact ? "" : "sm:col-span-2"} relative cursor-text`}>
          <label htmlFor={`where-${variant}`} className={label}>
            Where
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            <input
              id={`where-${variant}`}
              type="text"
              role="combobox"
              aria-expanded={showList}
              aria-controls={`where-list-${variant}`}
              aria-autocomplete="list"
              autoComplete="off"
              placeholder="City or neighbourhood"
              value={location}
              onFocus={() => setOpen("where")}
              onChange={(e) => {
                setLocation(e.target.value);
                setActive(-1);
                setOpen("where");
              }}
              onKeyDown={onWhereKey}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted/70"
            />
            {location && (
              <button
                type="button"
                aria-label="Clear location"
                onClick={() => {
                  setLocation("");
                  setOpen("where");
                }}
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-border hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {showList && (
            <ul
              id={`where-list-${variant}`}
              role="listbox"
              className="animate-pop absolute inset-x-0 top-full z-30 mt-2 max-w-md overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lift"
            >
              <li className="px-3 pb-1 pt-2 text-xs font-medium text-muted" role="presentation">
                {query ? "Matching destinations" : "Popular destinations"}
              </li>
              {matches.map((s, i) => (
                <li key={s} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => chooseLocation(s)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-surface ${
                      i === active ? "bg-surface" : ""
                    }`}
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <MapPin className="size-4" />
                    </span>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!compact && <div className="mx-2 h-px bg-border sm:col-span-2" aria-hidden />}

        {/* Dates */}
        <button
          type="button"
          onClick={() => setOpen(open === "dates" ? null : "dates")}
          aria-expanded={open === "dates"}
          aria-haspopup="dialog"
          className={`${field} ${open === "dates" ? "bg-surface" : ""}`}
        >
          <span className={label}>Dates</span>
          <span className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
            {checkIn && checkOut ? (
              <span className="font-semibold tabular">{formatRange(checkIn, checkOut)}</span>
            ) : checkIn ? (
              <span className="font-semibold tabular">{formatShort(checkIn)}, add check-out</span>
            ) : (
              <span className="font-medium text-muted/80">Add dates</span>
            )}
          </span>
        </button>

        {/* Guests */}
        <button
          type="button"
          onClick={() => setOpen(open === "guests" ? null : "guests")}
          aria-expanded={open === "guests"}
          aria-haspopup="dialog"
          className={`${field} ${open === "guests" ? "bg-surface" : ""}`}
        >
          <span className={label}>Guests</span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="tabular">
              {guests} guest{guests > 1 ? "s" : ""}
            </span>
          </span>
        </button>

        <button
          type="submit"
          className={`flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover ${
            compact ? "h-12 px-6" : "mt-1 h-13 sm:col-span-2"
          }`}
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </div>

      {open === "dates" && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 flex justify-center">
          <div
            role="dialog"
            aria-label="Choose dates"
            className="animate-pop @container w-full rounded-2xl border border-border bg-card p-4 shadow-lift md:max-w-[44rem]"
          >
            <DateRangeCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(a, b) => {
                setCheckIn(a);
                setCheckOut(b);
              }}
              onDone={() => setOpen("guests")}
            />
          </div>
        </div>
      )}

      {open === "guests" && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 flex justify-end">
          <div
            role="dialog"
            aria-label="Choose guests"
            className="animate-pop w-full rounded-2xl border border-border bg-card p-5 shadow-lift sm:max-w-sm"
          >
            <GuestStepper value={guests} onChange={setGuests} />
          </div>
        </div>
      )}
    </form>
  );
}
