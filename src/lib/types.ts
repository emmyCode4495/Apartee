/** Built-in defaults; admins can add more via property_types table */
export type PropertyType = string;
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type UserRole = "guest" | "host" | "admin";
export type AgencyStatus = "pending" | "verified" | "rejected" | "suspended";

export interface PropertyTypeRow {
  id: string;
  slug: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Agency {
  id: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  registrationDocs: string[];
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  verifiedContactEmails: string[];
  status: AgencyStatus;
  notes?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  type: PropertyType;
  /** Always stored in USD */
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  description: string;
  amenities: string[];
  images: string[];
  host: {
    name: string;
    avatar: string;
    joined: string;
    isSuperhost: boolean;
  };
  highlights: string[];
  coordinates: { lat: number; lng: number };
  isPublished?: boolean;
  /** null / undefined = public listing (not tied to an agency) */
  agencyId?: string | null;
  agencyName?: string | null;
}

export interface Booking {
  id: string;
  propertyId: string | null;
  propertyTitle?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNightUsd: number;
  cleaningFeeUsd: number;
  serviceFeeUsd: number;
  totalUsd: number;
  currency: "USD" | "NGN";
  totalDisplay?: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  country?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProperties: number;
  publishedProperties: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  revenueUsd: number;
  totalUsers: number;
  recentBookings: Booking[];
}
