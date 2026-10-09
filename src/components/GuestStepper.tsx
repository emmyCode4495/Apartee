"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

const btn =
  "flex size-9 items-center justify-center rounded-full border border-border transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border";

export default function GuestStepper({ value, onChange, min = 1, max = 16 }: Props) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-semibold">Guests</p>
        <p className="text-xs text-muted">Everyone staying, including children</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Fewer guests"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={btn}
        >
          <Minus className="size-4" />
        </button>
        <span
          className="w-6 text-center text-sm font-semibold tabular"
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          aria-label="More guests"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={btn}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
