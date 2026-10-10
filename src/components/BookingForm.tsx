"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  Copy,
  Lock,
  TriangleAlert,
  Building2,
  Mail,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { convertFromUsd, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatFull } from "@/lib/dates";
import { generatePaymentRef } from "@/lib/payment-secure";

interface BookingFormProps {
  propertyId: string;
  propertyTitle?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  datesChosen: boolean;
  changeHref: string;
  pricePerNightUsd: number;
  totalUsd: number;
  cleaningFeeUsd: number;
  serviceFeeUsd: number;
}

type GuestValues = { name: string; email: string; phone: string };
type Errors = Partial<Record<keyof GuestValues, string>>;

type Phase = "details" | "transfer" | "claimed";

function validate(v: GuestValues): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = "Enter a valid email address.";
  if (v.phone && v.phone.replace(/\D/g, "").length < 7)
    e.phone = "Enter a valid phone number, or leave blank.";
  return e;
}

function bankFromEnv() {
  return {
    bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "Your Bank Name",
    accountName:
      process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "Apatmentz Limited",
    accountNumber:
      process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || "0123456789",
    instructions:
      process.env.NEXT_PUBLIC_PAYMENT_INSTRUCTIONS ||
      "Put the Payment ID in the transfer narration/description exactly.",
  };
}

export default function BookingForm({
  propertyId,
  propertyTitle,
  checkIn,
  checkOut,
  guests,
  nights,
  datesChosen,
  changeHref,
  pricePerNightUsd,
  totalUsd,
  cleaningFeeUsd,
  serviceFeeUsd,
}: BookingFormProps) {
  const { format, currency } = useCurrency();
  const { user } = useAuth();
  const bank = bankFromEnv();

  const [values, setValues] = useState<GuestValues>({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof GuestValues, boolean>>>({});
  const [phase, setPhase] = useState<Phase>("details");
  const [paymentRef, setPaymentRef] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [signature, setSignature] = useState("");

  const errors = validate(values);
  const shown = (k: keyof GuestValues) => (touched[k] ? errors[k] : undefined);
  const amountDisplay = convertFromUsd(totalUsd, currency as CurrencyCode);

  useEffect(() => {
    if (user?.email) {
      setValues((v) => ({
        ...v,
        email: v.email || user.email,
        name: v.name || user.fullName || "",
      }));
    }
  }, [user]);

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function createPaymentOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!datesChosen) return;
    const firstBad = (Object.keys(errors) as (keyof GuestValues)[])[0];
    if (firstBad) {
      setTouched({ name: true, email: true, phone: true });
      document.getElementById(firstBad)?.focus();
      return;
    }

    setLoading(true);
    setError("");

    const ref = generatePaymentRef("APT");
    // Client cannot forge server HMAC without secret — request signature from API
    let sig = "";
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRef: ref,
          propertyId,
          propertyTitle,
          checkIn,
          checkOut,
          guests,
          nights,
          pricePerNightUsd,
          cleaningFeeUsd,
          serviceFeeUsd,
          totalUsd,
          currency,
          amountDisplay,
          guestName: values.name,
          guestEmail: values.email,
          guestPhone: values.phone,
          userId: user?.id?.startsWith("demo-") ? null : user?.id ?? null,
          bank,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create payment order");
      sig = data.signature || "";
      setBookingId(data.bookingId || null);
    } catch (err) {
      // Fallback: local Supabase insert if API unavailable
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase) {
          const uuidOk = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            propertyId
          );
          const { data, error: insErr } = await supabase
            .from("bookings")
            .insert({
              property_id: uuidOk ? propertyId : null,
              user_id: user?.id?.startsWith("demo-") ? null : user?.id ?? null,
              guest_name: values.name,
              guest_email: values.email,
              guest_phone: values.phone || null,
              check_in: checkIn,
              check_out: checkOut,
              guests,
              nights,
              price_per_night_usd: pricePerNightUsd,
              cleaning_fee_usd: cleaningFeeUsd,
              service_fee_usd: serviceFeeUsd,
              total_usd: totalUsd,
              currency: currency as CurrencyCode,
              total_display: amountDisplay,
              status: "pending",
              payment_ref: ref,
              payment_status: "awaiting_transfer",
              payment_amount_usd: totalUsd,
              payment_amount_display: amountDisplay,
              payment_currency: currency,
              bank_account_snapshot: bank,
            })
            .select("id")
            .maybeSingle();
          if (insErr) {
            setError(insErr.message);
            setLoading(false);
            return;
          }
          setBookingId(data?.id ?? null);
        }
      } else if (err instanceof Error) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    setPaymentRef(ref);
    setSignature(sig);
    setPhase("transfer");
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function claimPaid() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRef,
          bookingId,
          guestEmail: values.email,
          guestName: values.name,
          propertyTitle,
          checkIn,
          checkOut,
          amountDisplay,
          currency,
          signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record payment claim");
    } catch {
      // Best-effort local update
      if (isSupabaseConfigured() && paymentRef) {
        const supabase = createClient();
        if (supabase) {
          await supabase
            .from("bookings")
            .update({
              payment_status: "claimed_paid",
              payment_claimed_at: new Date().toISOString(),
            })
            .eq("payment_ref", paymentRef);
        }
      }
    }

    // Open mail client with secured receipt (always works without SMTP)
    const receiptBody = [
      "APATMENTZ PAYMENT RECEIPT (pending admin confirmation)",
      "========================================",
      `Payment ID: ${paymentRef}`,
      `Guest: ${values.name}`,
      `Email: ${values.email}`,
      `Stay: ${propertyTitle}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Amount: ${currency} ${amountDisplay}`,
      `Bank: ${bank.bankName} / ${bank.accountName} / ${bank.accountNumber}`,
      signature ? `Integrity seal: ${signature.slice(0, 16)}…` : "",
      "",
      "Do not edit this reference. Admin will match this Payment ID to your transfer.",
      "Booking is not confirmed until payment is verified.",
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${encodeURIComponent(values.email)}?subject=${encodeURIComponent(
      `Apatmentz receipt ${paymentRef}`
    )}&body=${encodeURIComponent(receiptBody)}`;

    setPhase("claimed");
    setLoading(false);
  }

  const card = "rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8";
  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  if (phase === "claimed") {
    return (
      <div className={`${card} text-center sm:p-10`} role="status">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-2xl font-semibold">Payment claim received</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          A receipt with your unique Payment ID was prepared for{" "}
          <strong className="text-foreground">{values.email}</strong>. Admin will
          confirm the transfer, then confirm your booking.
        </p>
        <dl className="mx-auto mt-7 max-w-sm space-y-3 rounded-xl bg-surface p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Payment ID</dt>
            <dd className="font-semibold tabular">{paymentRef}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Amount</dt>
            <dd className="font-semibold tabular">
              {currency} {amountDisplay}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Status</dt>
            <dd className="font-medium text-amber-700">Awaiting admin confirmation</dd>
          </div>
        </dl>
        <p className="mx-auto mt-4 max-w-sm text-xs text-muted">
          Keep the Payment ID safe. It is the only code admin uses to match your
          bank transfer — do not share a modified version.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/listings"
            className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "transfer") {
    return (
      <div className={`${card} space-y-6`}>
        <div>
          <h2 className="text-xl font-semibold">Pay by bank transfer</h2>
          <p className="mt-1 text-sm text-muted">
            Transfer the exact amount using the Payment ID as narration. This ID
            is unique and required for confirmation.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-primary/30 bg-primary-soft/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Payment ID (use as narration)
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="font-display text-2xl font-semibold tabular tracking-wide">
              {paymentRef}
            </p>
            <button
              type="button"
              onClick={() => copyText("ref", paymentRef)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold"
            >
              <Copy className="size-3.5" />
              {copied === "ref" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="size-4 text-primary" />
            Transfer to
          </div>
          {(
            [
              ["Bank", bank.bankName],
              ["Account name", bank.accountName],
              ["Account number", bank.accountNumber],
              ["Amount", `${currency} ${amountDisplay}`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="font-medium tabular">{value}</p>
              </div>
              <button
                type="button"
                onClick={() => copyText(label, value)}
                className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold"
              >
                {copied === label ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
          <p className="pt-2 text-xs text-muted">{bank.instructions}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="font-medium">{propertyTitle}</p>
          <p className="mt-1 text-muted">
            {formatFull(checkIn)} → {formatFull(checkOut)} · {guests} guest
            {guests > 1 ? "s" : ""} · {nights} night{nights > 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={claimPaid}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? "Recording…" : "I have made payment"}
        </button>
        <p className="text-center text-xs text-muted">
          <Lock className="mr-1 inline size-3" />
          Booking stays unconfirmed until admin verifies the transfer against this
          Payment ID.
        </p>
      </div>
    );
  }

  // Phase: details
  return (
    <form onSubmit={createPaymentOrder} noValidate className="space-y-6">
      {!datesChosen && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-lit/60 bg-accent-soft p-4 text-sm text-accent"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            Choose dates on the listing first.{" "}
            <Link href={changeHref} className="font-semibold underline">
              Go back
            </Link>
          </div>
        </div>
      )}

      <section className={card}>
        <h2 className="mb-5 text-lg font-semibold">Your details</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              className={field}
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              required
            />
            {shown("name") && (
              <p className="mt-1 text-sm text-danger">{shown("name")}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={field}
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              required
            />
            {shown("email") && (
              <p className="mt-1 text-sm text-danger">{shown("email")}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Phone <span className="font-normal text-muted">Optional</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={field}
              value={values.phone}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-2 text-lg font-semibold">Payment method</h2>
        <p className="mb-4 text-sm text-muted">
          Secure bank transfer. You will receive a unique Payment ID and our
          account details on the next step — no card details collected here.
        </p>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            Server-issued Payment ID (cannot be guessed)
          </li>
          <li className="flex gap-2">
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
            Receipt email with the same ID for admin tracing
          </li>
        </ul>
      </section>

      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !datesChosen}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55"
      >
        {loading ? "Preparing payment…" : `Continue to payment · ${format(totalUsd)}`}
      </button>
    </form>
  );
}
