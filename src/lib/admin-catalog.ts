import type { Agency, PropertyTypeRow } from "@/lib/types";

const TYPES_KEY = "apartee_property_types";
const AGENCIES_KEY = "apartee_agencies";

export const DEFAULT_TYPES: PropertyTypeRow[] = [
  { id: "t1", slug: "apartment", label: "Apartment", isActive: true, sortOrder: 1 },
  { id: "t2", slug: "villa", label: "Villa", isActive: true, sortOrder: 2 },
  { id: "t3", slug: "hotel", label: "Hotel", isActive: true, sortOrder: 3 },
  { id: "t4", slug: "cabin", label: "Cabin", isActive: true, sortOrder: 4 },
  { id: "t5", slug: "cottage", label: "Cottage", isActive: true, sortOrder: 5 },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadDemoTypes(): PropertyTypeRow[] {
  return read(TYPES_KEY, DEFAULT_TYPES);
}

export function saveDemoTypes(rows: PropertyTypeRow[]) {
  write(TYPES_KEY, rows);
}

export function loadDemoAgencies(): Agency[] {
  return read(AGENCIES_KEY, [] as Agency[]);
}

export function saveDemoAgencies(rows: Agency[]) {
  write(AGENCIES_KEY, rows);
}

export function slugify(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "type";
}
