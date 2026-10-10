/**
 * Static demo data removed — all listings come from Supabase via @/lib/data.
 * Kept only so accidental imports do not break the build.
 */
import type { Property } from "@/lib/types";

export type { Property };
export type PropertyType = string;

/** @deprecated Always empty — use getProperties() from @/lib/data */
export const properties: Property[] = [];

/** @deprecated Use getPropertyById from @/lib/data */
export function getPropertyById(_id: string): Property | undefined {
  return undefined;
}

export function filterProperties(filters: {
  location?: string;
  type?: string | "all";
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}): Property[] {
  void filters;
  return [];
}
