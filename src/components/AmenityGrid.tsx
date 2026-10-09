"use client";

import { useState } from "react";
import {
  Wifi, ChefHat, Wind, Car, Flame, Waves, WashingMachine, Utensils, Tv,
  Laptop, Dumbbell, ShieldCheck, Mountain, Snowflake, Coffee, Trees,
  ArrowUpDown, Building2, Bell, Bike, Sun, Check, Bath, Thermometer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: [string, LucideIcon][] = [
  ["wifi", Wifi],
  ["kitchen", ChefHat],
  ["air conditioning", Wind],
  ["parking", Car],
  ["fireplace", Flame],
  ["pool", Waves],
  ["view", Mountain],
  ["beach", Waves],
  ["washer", WashingMachine],
  ["dining", Utensils],
  ["tv", Tv],
  ["workspace", Laptop],
  ["gym", Dumbbell],
  ["doorman", ShieldCheck],
  ["concierge", Bell],
  ["elevator", ArrowUpDown],
  ["heating", Thermometer],
  ["ski", Snowflake],
  ["breakfast", Coffee],
  ["garden", Trees],
  ["terrace", Sun],
  ["bike", Bike],
  ["room service", Bell],
  ["hot tub", Bath],
  ["sauna", Bath],
  ["hammam", Bath],
];

function iconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
  return ICONS.find(([k]) => n.includes(k))?.[1] ?? (n.includes("building") ? Building2 : Check);
}

const LIMIT = 8;

export default function AmenityGrid({ amenities }: { amenities: string[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? amenities : amenities.slice(0, LIMIT);

  return (
    <div>
      <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {shown.map((a) => {
          const Icon = iconFor(a);
          return (
            <li key={a} className="flex items-center gap-3 text-[15px]">
              <Icon className="size-5 shrink-0 text-muted" aria-hidden />
              {a}
            </li>
          );
        })}
      </ul>
      {amenities.length > LIMIT && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll((v) => !v)}
          className="mt-6 h-11 rounded-xl border border-foreground px-5 text-sm font-semibold transition hover:bg-foreground hover:text-white"
        >
          {all ? "Show fewer amenities" : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
}
