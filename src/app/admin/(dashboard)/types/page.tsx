"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PropertyTypeRow } from "@/lib/types";
import {
  DEFAULT_TYPES,
  loadDemoTypes,
  saveDemoTypes,
  slugify,
} from "@/lib/admin-catalog";

export default function PropertyTypesPage() {
  const [rows, setRows] = useState<PropertyTypeRow[]>([]);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!isSupabaseConfigured()) {
      setRows(loadDemoTypes());
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("property_types")
      .select("*")
      .order("sort_order");
    if (err) {
      setError(err.message);
      setRows(loadDemoTypes());
      return;
    }
    setRows(
      (data || []).map((r) => ({
        id: r.id,
        slug: r.slug,
        label: r.label,
        description: r.description || "",
        isActive: r.is_active,
        sortOrder: r.sort_order,
      }))
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addType(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const lab = label.trim();
    if (!lab) return;
    const slug = slugify(lab);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      const next = [
        ...loadDemoTypes(),
        {
          id: `t-${Date.now()}`,
          slug,
          label: lab,
          description: description.trim(),
          isActive: true,
          sortOrder: loadDemoTypes().length + 1,
        },
      ];
      saveDemoTypes(next);
      setRows(next);
      setLabel("");
      setDescription("");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    const { error: err } = await supabase.from("property_types").insert({
      slug,
      label: lab,
      description: description.trim(),
      is_active: true,
      sort_order: rows.length + 1,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setLabel("");
    setDescription("");
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this type?")) return;
    if (!isSupabaseConfigured()) {
      const next = loadDemoTypes().filter((t) => t.id !== id);
      saveDemoTypes(next.length ? next : DEFAULT_TYPES);
      setRows(next.length ? next : DEFAULT_TYPES);
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("property_types").delete().eq("id", id);
    await refresh();
  }

  async function toggleActive(row: PropertyTypeRow) {
    if (!isSupabaseConfigured()) {
      const next = loadDemoTypes().map((t) =>
        t.id === row.id ? { ...t, isActive: !t.isActive } : t
      );
      saveDemoTypes(next);
      setRows(next);
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    await supabase
      .from("property_types")
      .update({ is_active: !row.isActive })
      .eq("id", row.id);
    await refresh();
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Property types</h1>
        <p className="mt-1 text-sm text-muted">
          Add categories (e.g. Duplex, Serviced apartment, Short-let) for listings.
        </p>
      </div>

      <form
        onSubmit={addType}
        className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft"
      >
        <h2 className="font-semibold">Add type</h2>
        <input
          className={field}
          placeholder="Label (e.g. Serviced apartment)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <input
          className={field}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          <Plus className="size-4" />
          Add type
        </button>
      </form>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {r.label}{" "}
                <span className="text-xs font-normal text-muted">({r.slug})</span>
              </p>
              {r.description && (
                <p className="text-xs text-muted">{r.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(r)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  r.isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-surface text-muted"
                }`}
              >
                {r.isActive ? "Active" : "Hidden"}
              </button>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="rounded-lg p-2 text-muted hover:bg-surface hover:text-danger"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
