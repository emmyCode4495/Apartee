/**
 * Server-safe payment reference helpers.
 * References are random + HMAC so clients cannot forge a valid receipt id.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

export function generatePaymentRef(prefix = "APT"): string {
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let body = "";
  for (let i = 0; i < 10; i++) body += ALPHABET[bytes[i]! % ALPHABET.length];
  // Check digit (simple weighted sum) — detects typos
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += (i + 1) * body.charCodeAt(i);
  }
  const check = ALPHABET[sum % ALPHABET.length];
  return `${prefix}-${body}${check}`;
}

/** HMAC-SHA256 hex using Web Crypto (browser or edge) */
export async function signPaymentPayload(
  secret: string,
  payload: {
    paymentRef: string;
    propertyId: string;
    amount: number;
    currency: string;
    checkIn: string;
    checkOut: string;
    guestEmail: string;
  }
): Promise<string> {
  const msg = [
    payload.paymentRef,
    payload.propertyId,
    payload.amount.toFixed(2),
    payload.currency,
    payload.checkIn,
    payload.checkOut,
    payload.guestEmail.toLowerCase().trim(),
  ].join("|");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPaymentSignature(
  secret: string,
  payload: Parameters<typeof signPaymentPayload>[1],
  signature: string
): Promise<boolean> {
  const expected = await signPaymentPayload(secret, payload);
  if (expected.length !== signature.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) {
    ok |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return ok === 0;
}

export type BankAccount = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
};

export function getBankAccountFromEnv(): BankAccount {
  return {
    bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "Your Bank",
    accountName: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "Apatmentz Limited",
    accountNumber: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || "0000000000",
    instructions:
      process.env.NEXT_PUBLIC_PAYMENT_INSTRUCTIONS ||
      "Use the Payment ID exactly as the transfer narration/reference.",
  };
}
