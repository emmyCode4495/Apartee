"use client";

import { useEffect, useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Agency, AgencyStatus } from "@/lib/types";
import { loadDemoAgencies, saveDemoAgencies } from "@/lib/admin-catalog";
import MediaField from "@/components/admin/MediaField";

const STATUSES: AgencyStatus[] = [
  "pending",
  "verified",
  "rejected",
  "suspended",
];

const emptyForm = {
  name: "",
  legalName: "",
  registrationNumber: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  address: "",
  city: "",
  country: "Nigeria",
  verifiedEmails: "",
  notes: "",
  status: "pending" as AgencyStatus,
  docs: [] as string[],
  logoUrl: "",
};

export default function AgenciesPage() {
  const [rows, setRows] = useState<Agency[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    if (!isSupabaseConfigured()) {
      setRows(loadDemoAgencies());
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("agencies")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setRows(loadDemoAgencies());
      return;
    }
    setRows(
      (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        legalName: r.legal_name || undefined,
        registrationNumber: r.registration_number || undefined,
        registrationDocs: r.registration_docs || [],
        contactEmail: r.contact_email,
        contactPhone: r.contact_phone || undefined,
        website: r.website || undefined,
        address: r.address || undefined,
        city: r.city || undefined,
        country: r.country || undefined,
        logoUrl: r.logo_url || undefined,
        verifiedContactEmails: r.verified_contact_emails || [],
        status: r.status as AgencyStatus,
        notes: r.notes || undefined,
        createdAt: r.created_at,
      }))
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const verified = form.verifiedEmails
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      legal_name: form.legalName.trim() || null,
      registration_number: form.registrationNumber.trim() || null,
      registration_docs: form.docs,
      contact_email: form.contactEmail.trim(),
      contact_phone: form.contactPhone.trim() || null,
      website: form.website.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || "Nigeria",
      logo_url: form.logoUrl.trim() || null,
      verified_contact_emails: verified,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    if (!isSupabaseConfigured()) {
      const agency: Agency = {
        id: `ag-${Date.now()}`,
        name: payload.name,
        legalName: payload.legal_name || undefined,
        registrationNumber: payload.registration_number || undefined,
        registrationDocs: payload.registration_docs,
        contactEmail: payload.contact_email,
        contactPhone: payload.contact_phone || undefined,
        website: payload.website || undefined,
        address: payload.address || undefined,
        city: payload.city || undefined,
        country: payload.country || undefined,
        logoUrl: payload.logo_url || undefined,
        verifiedContactEmails: payload.verified_contact_emails,
        status: payload.status,
        notes: payload.notes || undefined,
        createdAt: new Date().toISOString(),
      };
      const next = [agency, ...loadDemoAgencies()];
      saveDemoAgencies(next);
      setRows(next);
      setForm(emptyForm);
      setShowForm(false);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    const { error: err } = await supabase.from("agencies").insert(payload);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    await refresh();
  }

  async function setStatus(id: string, status: AgencyStatus) {
    if (!isSupabaseConfigured()) {
      const next = loadDemoAgencies().map((a) =>
        a.id === id ? { ...a, status } : a
      );
      saveDemoAgencies(next);
      setRows(next);
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("agencies").update({ status }).eq("id", id);
    await refresh();
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  const statusStyle: Record<AgencyStatus, string> = {
    verified: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-800",
    rejected: "bg-red-50 text-red-700",
    suspended: "bg-surface text-muted",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Real estate agencies</h1>
          <p className="mt-1 text-sm text-muted">
            Register and verify companies. Only verified agencies can be linked to
            listings (or choose Public).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="size-4" />
          Add agency
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <h2 className="font-semibold">New agency</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Trading name *</label>
              <input
                className={field}
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Legal name</label>
              <input
                className={field}
                value={form.legalName}
                onChange={(e) => set("legalName", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Registration number (CAC etc.)
              </label>
              <input
                className={field}
                value={form.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Primary email *</label>
              <input
                type="email"
                className={field}
                required
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                className={field}
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Website</label>
              <input
                className={field}
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                className={field}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input
                className={field}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <input
                className={field}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Verified contact emails (comma-separated)
              </label>
              <input
                className={field}
                placeholder="ops@agency.com, legal@agency.com"
                value={form.verifiedEmails}
                onChange={(e) => set("verifiedEmails", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className={field}
                value={form.status}
                onChange={(e) => set("status", e.target.value as AgencyStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Logo URL (optional)</label>
              <input
                className={field}
                value={form.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <MediaField
                label="Legal / registration documents"
                hint="Upload CAC certificate, utility bill, ID — or paste document URLs"
                values={form.docs}
                onChange={(docs) => set("docs", docs)}
                bucket="agency-docs"
                accept="image/*,.pdf"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Internal notes</label>
              <textarea
                className={field}
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save agency"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {rows.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
            <Building2 className="mx-auto mb-2 size-8 opacity-40" />
            No agencies yet. Add a registered real estate company to get started.
          </li>
        )}
        {rows.map((a) => (
          <li
            key={a.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{a.name}</p>
                {a.legalName && (
                  <p className="text-xs text-muted">Legal: {a.legalName}</p>
                )}
                <p className="mt-1 text-sm text-muted">
                  {a.contactEmail}
                  {a.contactPhone ? ` · ${a.contactPhone}` : ""}
                  {a.city ? ` · ${a.city}` : ""}
                </p>
                {a.registrationNumber && (
                  <p className="text-xs text-muted">
                    Reg. No: {a.registrationNumber}
                  </p>
                )}
                {a.verifiedContactEmails.length > 0 && (
                  <p className="mt-1 text-xs text-muted">
                    Verified emails: {a.verifiedContactEmails.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[a.status]}`}
                >
                  {a.status}
                </span>
                <select
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                  value={a.status}
                  onChange={(e) =>
                    setStatus(a.id, e.target.value as AgencyStatus)
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      Mark {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {a.registrationDocs.length > 0 && (
              <p className="mt-2 text-xs text-muted">
                {a.registrationDocs.length} document
                {a.registrationDocs.length > 1 ? "s" : ""} on file
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
