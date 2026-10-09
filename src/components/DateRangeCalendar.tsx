"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatLong,
  formatMonth,
  nightsBetween,
  parseISO,
  toISO,
  todayISO,
} from "@/lib/dates";

interface Props {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  /** Called once a full range has been chosen. */
  onDone?: () => void;
  /** 2 shows two months when the container is wide enough. */
  months?: 1 | 2;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthCells(year: number, month: number): (Date | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function DateRangeCalendar({
  checkIn,
  checkOut,
  onChange,
  onDone,
  months = 2,
}: Props) {
  const today = todayISO();
  const [view, setView] = useState(() => {
    const base = checkIn ? parseISO(checkIn) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [hover, setHover] = useState("");

  const currentMonthStart = (() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  })();
  const canGoBack = view.getTime() > currentMonthStart.getTime();

  function pick(iso: string) {
    if (!checkIn || checkOut) {
      onChange(iso, "");
      return;
    }
    if (iso > checkIn) {
      onChange(checkIn, iso);
      onDone?.();
      return;
    }
    onChange(iso, "");
  }

  const previewEnd = checkOut || (checkIn && hover > checkIn ? hover : "");
  const nights = nightsBetween(checkIn, checkOut);

  const shown = Array.from({ length: months }, (_, i) => {
    return new Date(view.getFullYear(), view.getMonth() + i, 1);
  });

  return (
    <div>
      <div className="flex gap-8">
        {shown.map((m, idx) => (
          <div
            key={m.toISOString()}
            className={`min-w-0 flex-1 ${idx > 0 ? "hidden @[34rem]:block" : ""}`}
          >
            <div className="mb-3 flex h-9 items-center justify-between">
              {idx === 0 ? (
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={!canGoBack}
                  onClick={() =>
                    setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
                  }
                  className="flex size-9 items-center justify-center rounded-full transition hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="size-4" />
                </button>
              ) : (
                <span className="size-9" />
              )}
              <p className="text-sm font-semibold" aria-live="polite">
                {formatMonth(m)}
              </p>
              {idx === shown.length - 1 || idx === 0 ? (
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() =>
                    setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
                  }
                  className={`flex size-9 items-center justify-center rounded-full transition hover:bg-surface ${
                    months === 2 && idx === 0 ? "@[34rem]:invisible" : ""
                  }`}
                >
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <span className="size-9" />
              )}
            </div>

            <div className="grid grid-cols-7 text-center text-xs text-muted">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1.5">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7" onMouseLeave={() => setHover("")}>
              {monthCells(m.getFullYear(), m.getMonth()).map((date, i) => {
                if (!date) return <span key={`b${i}`} />;
                const iso = toISO(date);
                const disabled = iso < today;
                const isStart = iso === checkIn;
                const isEnd = iso === checkOut;
                const inRange =
                  !!checkIn && !!previewEnd && iso > checkIn && iso < previewEnd;
                const hasRange = !!checkIn && !!previewEnd;
                const cap =
                  hasRange && isStart
                    ? "rounded-l-full"
                    : hasRange && (isEnd || iso === previewEnd)
                      ? "rounded-r-full"
                      : "";
                const band =
                  inRange || (hasRange && (isStart || iso === previewEnd))
                    ? "bg-primary-soft"
                    : "";

                return (
                  <div key={iso} className={`h-10 ${band} ${cap}`}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(iso)}
                      onMouseEnter={() => setHover(iso)}
                      aria-label={formatLong(iso)}
                      aria-pressed={isStart || isEnd}
                      className={`mx-auto flex size-11 items-center justify-center rounded-full text-sm tabular transition active:scale-95 sm:size-10 ${
                        isStart || isEnd
                          ? "bg-primary font-semibold text-white"
                          : disabled
                            ? "cursor-not-allowed text-muted/40"
                            : iso === today
                              ? "font-semibold ring-1 ring-inset ring-foreground/30 hover:bg-primary-soft"
                              : "hover:bg-primary-soft"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-3 text-sm">
        <p className="min-w-0 truncate text-muted" aria-live="polite">
          {!checkIn
            ? "Choose your check-in date"
            : !checkOut
              ? "Now choose your check-out date"
              : `${nights} night${nights > 1 ? "s" : ""}, ${formatLong(checkIn)} to ${formatLong(checkOut)}`}
        </p>
        {checkIn && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="shrink-0 font-semibold underline underline-offset-4 transition hover:text-primary"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
