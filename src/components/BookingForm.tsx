"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CalendarPlus, CheckCircle2, Lock, TriangleAlert } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { convertFromUsd, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatFull, formatLong } from "@/lib/dates";

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

type Values = {
  name: string;
  email: string;
  phone: string;
  card: string;
  expiry: string;
  cvc: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const formatCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter a valid email address, like name@example.com.";
  if (v.phone && v.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a phone number with at least 7 digits, or leave it blank.";
  const digits = v.card.replace(/\D/g, "");
  if (digits.length < 13) e.card = "Enter the full card number.";
  const m = v.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) {
    e.expiry = "Use the format MM/YY.";
  } else {
    const now = new Date();
    const exp = new Date(2000 + Number(m[2]), Number(m[1]), 0, 23, 59);
    if (exp < now) e.expiry = "This card has expired.";
  }
  if (!/^\d{3,4}$/.test(v.cvc)) e.cvc = "Enter the 3 or 4 digit security code.";
  return e;
}

function buildIcs(title: string, checkIn: string, checkOut: string, ref: string) {
  const d = (iso: string) => iso.replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Apartee//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${ref}@apartee`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d(checkIn)}`,
    `DTEND;VALUE=DATE:${d(checkOut)}`,
    `SUMMARY:${`Stay: ${title}`.replace(/([,;])/g, "\\$1")}`,
    `DESCRIPTION:Apartee booking ${ref}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const card = "rounded-2xl border border-border bg-card p-5 sm:p-6";
const inputCls = (err?: string) =>
  `w-full rounded-lg border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted/60 focus:ring-4 ${
    err
      ? "border-danger focus:border-danger focus:ring-danger/15"
      : "border-border focus:border-primary focus:ring-primary/15"
  }`;

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex justify-between text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
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
  const [values, setValues] = useState<Values>({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = validate(values);
  const shown = (k: keyof Values) => (touched[k] ? errors[k] : undefined);

  const bind = (k: keyof Values, fmt?: (v: string) => string) => ({
    id: k,
    name: k,
    value: values[k],
    "aria-invalid": !!shown(k),
    "aria-describedby": shown(k) ? `${k}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [k]: fmt ? fmt(e.target.value) : e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!datesChosen) return;

    const firstBad = (Object.keys(errors) as (keyof Values)[])[0];
    if (firstBad) {
      setTouched({ name: true, email: true, phone: true, card: true, expiry: true, cvc: true });
      document.getElementById(firstBad)?.focus();
      return;
    }

    setLoading(true);

    const payload = {
      property_id: propertyId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
        ? propertyId
        : null,
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
      total_display: convertFromUsd(totalUsd, currency),
      status: "pending",
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("bookings").insert(payload);
      }
    }

    setTimeout(() => {
      setReference(`APT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  }

  function downloadIcs() {
    const blob = new Blob([buildIcs(propertyTitle ?? "Apartee stay", checkIn, checkOut, reference)], {
      type: "text/calendar",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apartee-${reference}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (reference) {
    return (
      <div className={`${card} text-center sm:p-10`} role="status">
        <div className="animate-stamp mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-2xl font-semibold">Booking received</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Your reservation is pending confirmation. We&apos;ll use{" "}
          <strong className="text-foreground">{values.email}</strong> to reach you.
        </p>

        <dl className="mx-auto mt-7 max-w-sm space-y-3 rounded-xl bg-surface p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Reference</dt>
            <dd className="font-semibold tabular">{reference}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Stay</dt>
            <dd className="text-right font-medium">{propertyTitle}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Dates</dt>
            <dd className="text-right font-medium tabular">
              {formatFull(checkIn)} to {formatFull(checkOut)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Total</dt>
            <dd className="font-semibold tabular">{format(totalUsd)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={downloadIcs}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <CalendarPlus className="size-4" aria-hidden />
            Add to calendar
          </button>
          <Link
            href="/listings?type=apartment"
            className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold transition hover:border-foreground"
          >
            Browse more apartments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {!datesChosen && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-lit/60 bg-accent-soft p-4 text-sm text-accent">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            You haven&apos;t chosen dates yet.{" "}
            <Link href={changeHref} className="font-semibold underline underline-offset-4">
              Choose dates
            </Link>{" "}
            to continue.
          </p>
        </div>
      )}

      <section className={card}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your trip</h2>
          <Link href={changeHref} className="text-sm font-semibold underline underline-offset-4 transition hover:text-primary">
            Change
          </Link>
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Check-in</dt>
            <dd className="mt-0.5 font-semibold tabular">{checkIn ? formatLong(checkIn) : "Not chosen"}</dd>
          </div>
          <div>
            <dt className="text-muted">Check-out</dt>
            <dd className="mt-0.5 font-semibold tabular">{checkOut ? formatLong(checkOut) : "Not chosen"}</dd>
          </div>
          <div>
            <dt className="text-muted">Guests</dt>
            <dd className="mt-0.5 font-semibold tabular">{guests}</dd>
          </div>
        </dl>
      </section>

      <section className={card}>
        <h2 className="mb-5 text-lg font-semibold">Guest details</h2>
        <div className="space-y-4">
          <Field id="name" label="Full name" error={shown("name")}>
            <input type="text" autoComplete="name" placeholder="Jane Doe" className={inputCls(shown("name"))} {...bind("name")} />
          </Field>
          <Field id="email" label="Email" error={shown("email")}>
            <input type="email" autoComplete="email" placeholder="jane@example.com" className={inputCls(shown("email"))} {...bind("email")} />
          </Field>
          <Field id="phone" label="Phone" optional error={shown("phone")}>
            <input type="tel" autoComplete="tel" placeholder="+234 801 000 0000" className={inputCls(shown("phone"))} {...bind("phone")} />
          </Field>
        </div>
      </section>

      <section className={card}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment</h2>
          <Lock className="size-4 text-muted" aria-hidden />
        </div>
        <p className="mb-5 text-sm text-muted">
          Demo only, no real charges. Amounts are shown in {currency}.
        </p>
        <div className="space-y-4">
          <Field id="card" label="Card number" error={shown("card")}>
            <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" className={`${inputCls(shown("card"))} tabular`} {...bind("card", formatCard)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="expiry" label="Expiry" error={shown("expiry")}>
              <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" className={`${inputCls(shown("expiry"))} tabular`} {...bind("expiry", formatExpiry)} />
            </Field>
            <Field id="cvc" label="Security code" error={shown("cvc")}>
              <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} className={`${inputCls(shown("cvc"))} tabular`} {...bind("cvc", (v) => v.replace(/\D/g, "").slice(0, 4))} />
            </Field>
          </div>
        </div>
      </section>

      <p className="text-sm text-muted">
        Many stays offer free cancellation up to 48 hours before check-in.
      </p>

      <button
        type="submit"
        disabled={loading || !datesChosen}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55"
      >
        {loading ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
            Processing payment
          </>
        ) : (
          <>
            <Lock className="size-4" aria-hidden />
            Confirm and pay {format(totalUsd)}
          </>
        )}
      </button>
    </form>
  );
}
