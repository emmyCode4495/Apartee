"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Property, PropertyType } from "@/lib/types";

const TYPES: PropertyType[] = ["villa", "apartment", "cabin", "hotel", "cottage"];

interface Props {
  initial?: Property;
}

export default function PropertyForm({ initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [type, setType] = useState<PropertyType>(initial?.type ?? "apartment");
  const [price, setPrice] = useState(String(initial?.pricePerNight ?? ""));
  const [guests, setGuests] = useState(String(initial?.guests ?? 2));
  const [bedrooms, setBedrooms] = useState(String(initial?.bedrooms ?? 1));
  const [beds, setBeds] = useState(String(initial?.beds ?? 1));
  const [baths, setBaths] = useState(String(initial?.baths ?? 1));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amenities, setAmenities] = useState((initial?.amenities ?? []).join(", "));
  const [images, setImages] = useState((initial?.images ?? []).join("\n"));
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join(", "));
  const [hostName, setHostName] = useState(initial?.host.name ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished !== false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      title,
      location,
      city,
      country,
      type,
      price_per_night_usd: Number(price),
      guests: Number(guests),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      baths: Number(baths),
      description,
      amenities: amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      highlights: highlights
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      host_name: hostName,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      alert(
        "Supabase is not connected. Form data is ready but not saved.\nConnect Supabase and run schema.sql to enable writes."
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase client unavailable");
      setLoading(false);
      return;
    }

    if (initial?.id) {
      const { error: err } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", initial.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("properties").insert(payload);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    router.push("/admin/properties");
    router.refresh();
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input className={field} required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location (display)</label>
          <input className={field} required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos, Nigeria" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select className={field} value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input className={field} required value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <input className={field} required value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price / night (USD)</label>
          <input className={field} type="number" min={1} step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
          <p className="mt-1 text-xs text-muted">Guests in Nigeria see this converted to ₦</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Host name</label>
          <input className={field} value={hostName} onChange={(e) => setHostName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Guests</label>
          <input className={field} type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bedrooms</label>
          <input className={field} type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Beds</label>
          <input className={field} type="number" min={0} value={beds} onChange={(e) => setBeds(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Baths</label>
          <input className={field} type="number" min={0} value={baths} onChange={(e) => setBaths(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea className={field} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Amenities (comma-separated)</label>
          <input className={field} value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Wifi, Kitchen, Pool" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Highlights (comma-separated)</label>
          <input className={field} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Image URLs (one per line)</label>
          <textarea className={field} rows={3} value={images} onChange={(e) => setImages(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
            Published (visible on site)
          </label>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? "Saving…" : initial ? "Update property" : "Create property"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium hover:bg-surface"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
