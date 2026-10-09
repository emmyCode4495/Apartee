import { properties as staticProperties } from "@/data/properties";
import type { Property, Booking, Profile, DashboardStats } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function mapDbProperty(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    title: String(row.title),
    location: String(row.location),
    city: String(row.city),
    country: String(row.country),
    type: row.type as Property["type"],
    pricePerNight: Number(row.price_per_night_usd),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    guests: Number(row.guests),
    bedrooms: Number(row.bedrooms),
    beds: Number(row.beds),
    baths: Number(row.baths),
    description: String(row.description ?? ""),
    amenities: (row.amenities as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    highlights: (row.highlights as string[]) ?? [],
    host: {
      name: String(row.host_name ?? "Host"),
      avatar: String(row.host_avatar ?? ""),
      joined: String(row.host_joined ?? ""),
      isSuperhost: Boolean(row.is_superhost),
    },
    coordinates: {
      lat: Number(row.lat ?? 0),
      lng: Number(row.lng ?? 0),
    },
    isPublished: row.is_published !== false,
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
    totalDisplay: row.total_display != null ? Number(row.total_display) : undefined,
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
    return staticProperties.map((p) => ({ ...p, isPublished: true }));
  }

  let q = supabase.from("properties").select("*").order("created_at", { ascending: false });
  if (opts?.publishedOnly !== false) {
    q = q.eq("is_published", true);
  }
  const { data, error } = await q;
  if (error || !data?.length) {
    return staticProperties.map((p) => ({ ...p, isPublished: true }));
  }
  return data.map(mapDbProperty);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();
  if (!supabase) {
    const p = staticProperties.find((x) => x.id === id);
    return p ? { ...p, isPublished: true } : null;
  }

  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    const p = staticProperties.find((x) => x.id === id);
    return p ? { ...p, isPublished: true } : null;
  }
  return mapDbProperty(data);
}

export async function getAllPropertiesAdmin(): Promise<Property[]> {
  const supabase = await createClient();
  if (!supabase) {
    return staticProperties.map((p) => ({ ...p, isPublished: true }));
  }
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return staticProperties.map((p) => ({ ...p, isPublished: true }));
  return data.map(mapDbProperty);
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  if (!supabase) return getDemoBookings();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, properties(title)")
    .order("created_at", { ascending: false });
  if (error || !data) return getDemoBookings();
  return data.map(mapDbBooking);
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  if (!supabase) return getDemoProfiles();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return getDemoProfiles();
  return data.map((row) => ({
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

  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  return {
    totalProperties: properties.length,
    publishedProperties: properties.filter((p) => p.isPublished !== false).length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: confirmed.length,
    revenueUsd: confirmed.reduce((s, b) => s + b.totalUsd, 0),
    totalUsers: users.length,
    recentBookings: bookings.slice(0, 5),
  };
}

function getDemoBookings(): Booking[] {
  return [
    {
      id: "demo-b1",
      propertyId: "1",
      propertyTitle: "Sunset Cliff Villa with Infinity Pool",
      guestName: "Chioma Adebayo",
      guestEmail: "chioma@example.com",
      guestPhone: "+234 801 234 5678",
      checkIn: "2026-11-10",
      checkOut: "2026-11-15",
      guests: 4,
      nights: 5,
      pricePerNightUsd: 420,
      cleaningFeeUsd: 75,
      serviceFeeUsd: 252,
      totalUsd: 2427,
      currency: "NGN",
      totalDisplay: 2427 * 1600,
      status: "confirmed",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "demo-b2",
      propertyId: "3",
      propertyTitle: "Modern Loft in the Heart of Tokyo",
      guestName: "James Wilson",
      guestEmail: "james@example.com",
      checkIn: "2026-12-01",
      checkOut: "2026-12-05",
      guests: 2,
      nights: 4,
      pricePerNightUsd: 195,
      cleaningFeeUsd: 75,
      serviceFeeUsd: 94,
      totalUsd: 949,
      currency: "USD",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "demo-b3",
      propertyId: "7",
      propertyTitle: "Forest Cabin with Hot Tub",
      guestName: "Amara Okonkwo",
      guestEmail: "amara@example.com",
      checkIn: "2026-10-20",
      checkOut: "2026-10-23",
      guests: 2,
      nights: 3,
      pricePerNightUsd: 265,
      cleaningFeeUsd: 75,
      serviceFeeUsd: 95,
      totalUsd: 965,
      currency: "NGN",
      status: "completed",
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ];
}

function getDemoProfiles(): Profile[] {
  return [
    {
      id: "demo-u1",
      email: "admin@neststay.com",
      fullName: "Apartee Admin",
      role: "admin",
      country: "NG",
      createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "demo-u2",
      email: "chioma@example.com",
      fullName: "Chioma Adebayo",
      role: "guest",
      country: "NG",
      phone: "+234 801 234 5678",
      createdAt: "2026-06-15T00:00:00Z",
    },
    {
      id: "demo-u3",
      email: "james@example.com",
      fullName: "James Wilson",
      role: "guest",
      country: "US",
      createdAt: "2026-08-20T00:00:00Z",
    },
  ];
}
