/** Small, locale-independent date helpers (deterministic on server and client). */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = parseISO(checkOut).getTime() - parseISO(checkIn).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

/** 12 Oct */
export function formatShort(iso: string): string {
  if (!iso) return "";
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Mon 12 Oct */
export function formatLong(iso: string): string {
  if (!iso) return "";
  const d = parseISO(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Mon 12 Oct 2026 */
export function formatFull(iso: string): string {
  if (!iso) return "";
  const d = parseISO(iso);
  return `${formatLong(iso)} ${d.getFullYear()}`;
}

/** 12 Oct – 15 Oct */
export function formatRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "";
  return `${formatShort(checkIn)} – ${formatShort(checkOut)}`;
}

/** October 2026 */
export function formatMonth(d: Date): string {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}
