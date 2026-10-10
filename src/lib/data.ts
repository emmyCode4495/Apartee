import type { Property, Booking, Profile, DashboardStats, PropertyTypeRow } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

/** Always fetch fresh data from Supabase (no static placeholder fallback). */
export const dynamic = "force-dynamic";

function mapDbProperty(row: Record<string, unknown>): Property {
  const typeSlug = String(row.type_slug || row.type || "apartment");
  return {
    id: String(row.id),
    title: String(row.title),
    location: String(row.location),
    city: String(row.city),
    country: String(row.country),
    type: typeSlug,
    pricePerNight: Number(row.price_per_night_usd),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    guests: Number(row.guests),
    bedrooms: Number(row.bedrooms),
    beds: Number(row.beds),
    baths: Number(row.baths),
    description: String(row.description ?? ""),
    amenities: (row.amenities as string[]) ?? [],
    images: ((row.images as string[]) ?? []).filter(Boolean),
    highlights: (row.highlights as string[]) ?? [],
    host: (() => {
      const h = row.hosts as Record<string, unknown> | null | undefined;
      if (h && typeof h === "object") {
        return {
          name: String(h.name ?? row.host_name ?? "Host"),
          avatar: String(h.avatar_url ?? row.host_avatar ?? ""),
          joined: String(h.joined_year ?? row.host_joined ?? ""),
          isSuperhost: Boolean(h.is_superhost ?? row.is_superhost),
        };
      }
      return {
        name: String(row.host_name ?? "Host"),
        avatar: String(row.host_avatar ?? ""),
        joined: String(row.host_joined ?? ""),
        isSuperhost: Boolean(row.is_superhost),
      };
    })(),
    hostId: row.host_id ? String(row.host_id) : null,
    coordinates: {
      lat: Number(row.lat ?? 0),
      lng: Number(row.lng ?? 0),
    },
    isPublished: row.is_published !== false,
    agencyId: row.agency_id ? String(row.agency_id) : null,
    agencyName:
      row.agencies && typeof row.agencies === "object"
        ? String((row.agencies as { name?: string }).name ?? "")
        : null,
  };
}

function mapDbBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id),
    propertyId: row.property_id ? String(row.property_id) : null,
    propertyTitle: row.properties
      ? String((row.properties as { title?: string }).title ?? "")
      : undefined,
    guestName: String(row.guest_name),
    guestEmail: String(row.guest_email),
    guestPhone: row.guest_phone ? String(row.guest_phone) : undefined,
    checkIn: String(row.check_in),
    checkOut: String(row.check_out),
    guests: Number(row.guests),
    nights: Number(row.nights),
    pricePerNightUsd: Number(row.price_per_night_usd),
    cleaningFeeUsd: Number(row.cleaning_fee_usd),
    serviceFeeUsd: Number(row.service_fee_usd),
    totalUsd: Number(row.total_usd),
    currency: (row.currency as "USD" | "NGN") ?? "USD",
    totalDisplay:
      row.total_display != null ? Number(row.total_display) : undefined,
    status: row.status as Booking["status"],
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
  };
}

export async function getProperties(opts?: {
  publishedOnly?: boolean;
}): Promise<Property[]> {
  const supabase = await createClient();
  if (!supabase) {
    console.warn("[data] Supabase not configured — returning no properties");
    return [];
  }

  let q = supabase
    .from("properties")
    .select("*, agencies(name), hosts(name, avatar_url, joined_year, is_superhost)")
    .order("created_at", { ascending: false });

  if (opts?.publishedOnly !== false) {
    q = q.eq("is_published", true);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[data] getProperties:", error.message);
    return [];
  }
  return (data || []).map(mapDbProperty);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("properties")
    .select("*, agencies(name), hosts(name, avatar_url, joined_year, is_superhost)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[data] getPropertyById:", error.message);
    return null;
  }
  return mapDbProperty(data);
}

export async function getAllPropertiesAdmin(): Promise<Property[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("properties")
    .select("*, agencies(name), hosts(name, avatar_url, joined_year, is_superhost)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[data] getAllPropertiesAdmin:", error.message);
    return [];
  }
  return (data || []).map(mapDbProperty);
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*, properties(title)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[data] getBookings:", error.message);
    return [];
  }
  return (data || []).map(mapDbBooking);
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[data] getProfiles:", error.message);
    return [];
  }
  return (data || []).map((row) => ({
    id: String(row.id),
    email: String(row.email ?? ""),
    fullName: String(row.full_name ?? ""),
    phone: row.phone ? String(row.phone) : undefined,
    role: (row.role as Profile["role"]) ?? "guest",
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    country: row.country ? String(row.country) : undefined,
    createdAt: String(row.created_at),
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [properties, bookings, users] = await Promise.all([
    getAllPropertiesAdmin(),
    getBookings(),
    getProfiles(),
  ]);

  const confirmed = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  );

  return {
    totalProperties: properties.length,
    publishedProperties: properties.filter((p) => p.isPublished).length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: confirmed.length,
    revenueUsd: confirmed.reduce((s, b) => s + b.totalUsd, 0),
    totalUsers: users.length,
    recentBookings: bookings.slice(0, 8),
  };
}

export function filterPropertiesList(
  list: Property[],
  filters: {
    location?: string;
    type?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
  }
): Property[] {
  return list.filter((p) => {
    if (filters.location) {
      const q = filters.location.toLowerCase();
      const hay = `${p.location} ${p.city} ${p.country}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.type && filters.type !== "all" && p.type !== filters.type) {
      return false;
    }
    if (filters.guests && p.guests < filters.guests) return false;
    if (filters.beds && p.bedrooms < filters.beds) return false;
    if (filters.minPrice != null && p.pricePerNight < filters.minPrice)
      return false;
    if (filters.maxPrice != null && p.pricePerNight > filters.maxPrice)
      return false;
    return true;
  });
}


function mapTypeRow(r: Record<string, unknown>): PropertyTypeRow {
  return {
    id: String(r.id),
    slug: String(r.slug),
    label: String(r.label),
    description: r.description ? String(r.description) : "",
    isActive: r.is_active !== false,
    sortOrder: Number(r.sort_order ?? 0),
    showInNav: Boolean(r.show_in_nav),
  };
}

/** All active types (for search / listings filters) */
export async function getActivePropertyTypes(): Promise<PropertyTypeRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("property_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error || !data) {
    if (error) console.error("[data] getActivePropertyTypes:", error.message);
    return [];
  }
  return data.map(mapTypeRow);
}

/** Types featured in the navbar (max 5) */
export async function getNavPropertyTypes(): Promise<PropertyTypeRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("property_types")
    .select("*")
    .eq("is_active", true)
    .eq("show_in_nav", true)
    .order("sort_order")
    .limit(5);
  if (error || !data) {
    if (error) console.error("[data] getNavPropertyTypes:", error.message);
    return [];
  }
  return data.map(mapTypeRow);
}
