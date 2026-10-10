"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { useSaved } from "@/contexts/SavedContext";
import type { Property } from "@/lib/types";

export default function SavedList({ properties }: { properties: Property[] }) {
  const { ids, ready } = useSaved();
  const saved = properties.filter((p) => ids.includes(p.id));

  if (!ready) {
    return (
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/3] rounded-xl" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded" />
            <div className="skeleton mt-2 h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary-soft">
          <Heart className="size-6 text-primary" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold">No saved apartments yet</h2>
        <p className="mt-2 text-sm text-muted">
          Tap the heart on any apartment to keep it here for later.
        </p>
        <Link
          href="/listings?type=apartment"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Browse apartments
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {saved.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
