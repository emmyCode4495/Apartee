/**
 * Service charge only (no cleaning fee).
 * - Less than 7 nights: 5%
 * - 7+ nights: 10%
 */
export function serviceChargeRate(nights: number): number {
  if (nights >= 7) return 0.1;
  if (nights > 0) return 0.05;
  return 0;
}

export function serviceChargePercentLabel(nights: number): string {
  if (nights >= 7) return "10%";
  if (nights > 0) return "5%";
  return "—";
}

export function calcServiceChargeUsd(subtotalUsd: number, nights: number): number {
  if (nights < 1 || subtotalUsd <= 0) return 0;
  const rate = serviceChargeRate(nights);
  return Math.round(subtotalUsd * rate * 100) / 100;
}

export function calcBookingTotalUsd(
  pricePerNightUsd: number,
  nights: number
): { subtotal: number; serviceCharge: number; total: number; rate: number } {
  const subtotal = nights > 0 ? nights * pricePerNightUsd : 0;
  const rate = serviceChargeRate(nights);
  const serviceCharge = calcServiceChargeUsd(subtotal, nights);
  return {
    subtotal,
    serviceCharge,
    total: subtotal + serviceCharge,
    rate,
  };
}