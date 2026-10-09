"use client";

import { useState } from "react";
import { USD_TO_NGN } from "@/lib/currency";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [rate, setRate] = useState(String(USD_TO_NGN));
  const configured = isSupabaseConfigured();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Platform configuration</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 card-shadow">
          <h2 className="mb-1 text-lg font-semibold">Currency</h2>
          <p className="mb-4 text-sm text-muted">
            Base prices are stored in <strong>USD</strong>. Guests detected in
            Nigeria see <strong>₦ Naira</strong>; all other regions see{" "}
            <strong>$ USD</strong>.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium">
              USD → NGN rate
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <p className="mt-2 text-xs text-muted">
              Current code constant: {USD_TO_NGN}. Update{" "}
              <code className="rounded bg-surface px-1">src/lib/currency.ts</code>{" "}
              or wire a live FX API for production.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 card-shadow">
          <h2 className="mb-1 text-lg font-semibold">Supabase</h2>
          <p className="mb-3 text-sm text-muted">
            Backend status:{" "}
            {configured ? (
              <span className="font-medium text-success">Connected</span>
            ) : (
              <span className="font-medium text-amber-600">
                Not configured (demo mode)
              </span>
            )}
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>
              Create a project at{" "}
              <a
                href="https://supabase.com"
                className="text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                supabase.com
              </a>
            </li>
            <li>
              Copy URL and anon key into <code className="rounded bg-surface px-1">.env.local</code>
            </li>
            <li>
              Run <code className="rounded bg-surface px-1">supabase/schema.sql</code> in the SQL
              Editor
            </li>
            <li>
              Create an auth user and set{" "}
              <code className="rounded bg-surface px-1">profiles.role = &apos;admin&apos;</code>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 card-shadow">
          <h2 className="mb-1 text-lg font-semibold">Demo admin</h2>
          <p className="text-sm text-muted">
            Without Supabase: sign in with{" "}
            <strong>admin@neststay.com</strong> / <strong>admin123</strong>
          </p>
        </section>
      </div>
    
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-semibold">Storage buckets (image / doc uploads)</h2>
        <p className="mt-2 text-sm text-muted">
          In Supabase → Storage, create public buckets named{" "}
          <code className="rounded bg-surface px-1">property-images</code> and{" "}
          <code className="rounded bg-surface px-1">agency-docs</code>.
          Allow authenticated uploads. Run{" "}
          <code className="rounded bg-surface px-1">supabase/migration_agencies_types.sql</code>{" "}
          for agencies and custom property types.
        </p>
      </div>
    </div>
  );
}
