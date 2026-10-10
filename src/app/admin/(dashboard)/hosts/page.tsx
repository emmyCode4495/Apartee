"use client";

import { useEffect, useState } from "react";
import { Plus, UserCircle } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Host } from "@/lib/types";
import { loadDemoHosts, saveDemoHosts } from "@/lib/admin-catalog";
import MediaField from "@/components/admin/MediaField";

const empty = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  joinedYear: String(new Date().getFullYear()),
  isSuperhost: false,
  isActive: true,
  avatars: [] as string[],
};

export default function HostsPage() {
  const [rows, setRows] = useState<Host[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!isSupabaseConfigured()) {
      setRows(loadDemoHosts());
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("hosts")
      .select("*")
      .order("name");
    if (err) {
      setError(err.message);
      setRows(loadDemoHosts());
      return;
    }
    setRows(
      (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        avatarUrl: r.avatar_url || undefined,
        email: r.email || undefined,
        phone: r.phone || undefined,
        bio: r.bio || undefined,
        joinedYear: r.joined_year || undefined,
        isSuperhost: Boolean(r.is_superhost),
        isActive: r.is_active !== false,
      }))
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openNew() {
    setEditingId(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(h: Host) {
    setEditingId(h.id);
    setForm({
      name: h.name,
      email: h.email || "",
      phone: h.phone || "",
      bio: h.bio || "",
      joinedYear: h.joinedYear || "",
      isSuperhost: h.isSuperhost,
      isActive: h.isActive,
      avatars: h.avatarUrl ? [h.avatarUrl] : [],
    });
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const avatar = form.avatars[0] || null;
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
      joined_year: form.joinedYear.trim() || null,
      is_superhost: form.isSuperhost,
      is_active: form.isActive,
      avatar_url: avatar,
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const list = loadDemoHosts();
      if (editingId) {
        const next = list.map((h) =>
          h.id === editingId
            ? {
                ...h,
                name: payload.name,
                email: payload.email || undefined,
                phone: payload.phone || undefined,
                bio: payload.bio || undefined,
                joinedYear: payload.joined_year || undefined,
                isSuperhost: payload.is_superhost,
                isActive: payload.is_active,
                avatarUrl: avatar || undefined,
              }
            : h
        );
        saveDemoHosts(next);
        setRows(next);
      } else {
        const host: Host = {
          id: `h-${Date.now()}`,
          name: payload.name,
          email: payload.email || undefined,
          phone: payload.phone || undefined,
          bio: payload.bio || undefined,
          joinedYear: payload.joined_year || undefined,
          isSuperhost: payload.is_superhost,
          isActive: payload.is_active,
          avatarUrl: avatar || undefined,
        };
        const next = [host, ...list];
        saveDemoHosts(next);
        setRows(next);
      }
      setShowForm(false);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    if (editingId) {
      const { error: err } = await supabase
        .from("hosts")
        .update(payload)
        .eq("id", editingId);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("hosts").insert(payload);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setShowForm(false);
    await refresh();
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hosts</h1>
          <p className="mt-1 text-sm text-muted">
            People who appear on listing pages. Pick a host when creating a
            property.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="size-4" />
          Add host
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <h2 className="font-semibold">
            {editingId ? "Edit host" : "New host"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                className={field}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                className={field}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                className={field}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Joined year</label>
              <input
                className={field}
                placeholder="2021"
                value={form.joinedYear}
                onChange={(e) =>
                  setForm({ ...form, joinedYear: e.target.value })
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isSuperhost}
                  onChange={(e) =>
                    setForm({ ...form, isSuperhost: e.target.checked })
                  }
                />
                Superhost
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Bio</label>
              <textarea
                className={field}
                rows={2}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <MediaField
                label="Profile photo"
                hint="Upload or paste a URL — shown on the property page"
                values={form.avatars}
                onChange={(avatars) =>
                  setForm({ ...form, avatars: avatars.slice(0, 1) })
                }
                bucket="property-images"
                accept="image/*"
                multiple={false}
              />
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save host"}
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

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.length === 0 && (
          <li className="px-6 py-12 text-center text-sm text-muted">
            <UserCircle className="mx-auto mb-2 size-8 opacity-40" />
            No hosts yet. Add someone, then select them on a property.
          </li>
        )}
        {rows.map((h) => (
          <li
            key={h.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-surface">
              {h.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={h.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <UserCircle className="m-2 size-8 text-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {h.name}
                {h.isSuperhost && (
                  <span className="ml-2 text-xs font-semibold text-primary">
                    Superhost
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted">
                {[h.email, h.phone, h.joinedYear && `Joined ${h.joinedYear}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openEdit(h)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
