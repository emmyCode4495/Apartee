"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";

interface SearchBarProps {
  variant?: "hero" | "compact";
  defaultLocation?: string;
  defaultGuests?: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  suggestions?: string[];
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Native form + date/number inputs so search works on real phones
 * without relying on custom modals or client-only navigation.
 */
export default function SearchBar({
  variant = "hero",
  defaultLocation = "",
  defaultGuests = 2,
  defaultCheckIn = "",
  defaultCheckOut = "",
  suggestions = [],
}: SearchBarProps) {
  const [location, setLocation] = useState(defaultLocation);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const minDate = todayISO();
  const compact = variant === "compact";

  const query = location.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => query && s.toLowerCase().includes(query))
    .slice(0, 6);

  const input =
    "w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted/70";
  const box = compact
    ? "rounded-xl border border-border bg-card px-3 py-2"
    : "rounded-xl bg-surface/80 px-3 py-2.5";

  return (
    <form
      action="/listings"
      method="get"
      role="search"
      aria-label="Search apartments"
      className={`relative rounded-2xl border border-border bg-card p-2 ${
        compact ? "shadow-soft" : "shadow-lift"
      }`}
    >
      <div
        className={
          compact
            ? "grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto] md:items-end"
            : "grid gap-2 sm:grid-cols-2"
        }
      >
        {/* Where */}
        <div className={`relative ${box} ${compact ? "" : "sm:col-span-2"}`}>
          <label htmlFor={`where-${variant}`} className="text-xs font-medium text-muted">
            Where
          </label>
          <div className="mt-0.5 flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            <input
              id={`where-${variant}`}
              name="location"
              type="text"
              autoComplete="off"
              placeholder="City or neighbourhood"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // delay so suggestion tap registers
                window.setTimeout(() => setShowSuggestions(false), 150);
              }}
              className={input}
            />
            {location && (
              <button
                type="button"
                aria-label="Clear location"
                onClick={() => setLocation("")}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {showSuggestions && matches.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-auto rounded-xl border border-border bg-card p-1 shadow-lift">
              {matches.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setLocation(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Native date inputs — open the OS picker on real devices */}
        <div className={box}>
          <label htmlFor={`checkIn-${variant}`} className="text-xs font-medium text-muted">
            Check-in
          </label>
          <input
            id={`checkIn-${variant}`}
            name="checkIn"
            type="date"
            value={checkIn}
            min={minDate}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value && checkOut <= e.target.value) {
                setCheckOut("");
              }
            }}
            className={`${input} mt-0.5`}
          />
        </div>

        <div className={box}>
          <label htmlFor={`checkOut-${variant}`} className="text-xs font-medium text-muted">
            Check-out
          </label>
          <input
            id={`checkOut-${variant}`}
            name="checkOut"
            type="date"
            value={checkOut}
            min={checkIn || minDate}
            onChange={(e) => setCheckOut(e.target.value)}
            className={`${input} mt-0.5`}
          />
        </div>

        <div className={box}>
          <label htmlFor={`guests-${variant}`} className="text-xs font-medium text-muted">
            Guests
          </label>
          <input
            id={`guests-${variant}`}
            name="guests"
            type="number"
            inputMode="numeric"
            min={1}
            max={16}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            className={`${input} mt-0.5`}
          />
        </div>

        <button
          type="submit"
          className={`flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover ${
            compact ? "h-12 px-5" : "mt-1 h-12 sm:col-span-2"
          }`}
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </div>
    </form>
  );
}
