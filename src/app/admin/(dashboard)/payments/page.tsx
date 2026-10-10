"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Check, X, Search } from "lucide-react";

type Row = {
  id: string;
  payment_ref: string;
  payment_status: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_usd: number;
  total_display?: number;
  currency: string;
  property_id: string | null;
  payment_claimed_at?: string;
  status: string;
};

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    if (!isSupabaseConfigured()) {
      setError("Connect Supabase and run migration_manual_payments.sql");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("bookings")
      .select(
        "id, payment_ref, payment_status, guest_name, guest_email, check_in, check_out, total_usd, total_display, currency, property_id, payment_claimed_at, status"
      )
      .not("payment_ref", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((data as Row[]) || []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function confirmPayment(row: Row) {
    if (!confirm(`Confirm payment ${row.payment_ref} and activate booking?`)) return;
    setBusy(row.id);
    const supabase = createClient();
    if (!supabase) return;

    const { error: err } = await supabase
      .from("bookings")
      .update({
        payment_status: "confirmed",
        payment_confirmed_at: new Date().toISOString(),
        status: "confirmed",
      })
      .eq("id", row.id);

    if (err) {
      setError(err.message);
      setBusy(null);
      return;
    }

    // Mark property booked until checkout
    if (row.property_id && row.check_out) {
      await supabase
        .from("properties")
        .update({
          availability_status: "booked",
          available_from: row.check_out,
        })
        .eq("id", row.property_id);
    }

    setBusy(null);
    await refresh();
  }

  async function rejectPayment(row: Row) {
    if (!confirm(`Reject claim for ${row.payment_ref}?`)) return;
    setBusy(row.id);
    const supabase = createClient();
    if (!supabase) return;
    await supabase
      .from("bookings")
      .update({ payment_status: "rejected", status: "cancelled" })
      .eq("id", row.id);
    setBusy(null);
    await refresh();
  }

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      r.payment_ref?.toLowerCase().includes(s) ||
      r.guest_email?.toLowerCase().includes(s) ||
      r.guest_name?.toLowerCase().includes(s)
    );
  });

  const statusStyle: Record<string, string> = {
    awaiting_transfer: "bg-surface text-muted",
    claimed_paid: "bg-amber-100 text-amber-900",
    confirmed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-surface text-muted",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment confirmations</h1>
        <p className="mt-1 text-sm text-muted">
          Match bank transfers to Payment IDs. Confirm only after the money is in
          your account with the correct narration.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Payment ID, email, name…"
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <ul className="space-y-3">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
            No payment orders yet.
          </li>
        )}
        {filtered.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold tabular">
                  {r.payment_ref}
                </p>
                <p className="text-sm">
                  {r.guest_name} · {r.guest_email}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {r.check_in} → {r.check_out} · {r.currency}{" "}
                  {r.total_display ?? r.total_usd}
                  {r.payment_claimed_at
                    ? ` · claimed ${new Date(r.payment_claimed_at).toLocaleString()}`
                    : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  statusStyle[r.payment_status] || statusStyle.awaiting_transfer
                }`}
              >
                {(r.payment_status || "").replace(/_/g, " ")}
              </span>
            </div>
            {r.payment_status === "claimed_paid" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => confirmPayment(r)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  <Check className="size-4" />
                  Confirm payment & booking
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => rejectPayment(r)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold"
                >
                  <X className="size-4" />
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
