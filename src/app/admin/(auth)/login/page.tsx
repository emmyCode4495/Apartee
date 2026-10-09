"use client";

import { adminPath } from "@/lib/admin-path";
import { LogoMark } from "@/components/Logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Demo mode when Supabase is not configured
      if (!isSupabaseConfigured()) {
        if (
          (email === "admin@neststay.com" && password === "admin123") ||
          password === "admin123"
        ) {
          document.cookie = "apartee_staff=1; path=/; max-age=86400; SameSite=Lax";
          router.push(adminPath());
          router.refresh();
          return;
        }
        setError("Demo login: use admin@neststay.com / admin123");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("This account does not have admin access");
        setLoading(false);
        return;
      }

      document.cookie = "apartee_staff=1; path=/; max-age=86400; SameSite=Lax";
      router.push(adminPath());
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 card-shadow">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto mb-3 size-12" />
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Apatmentz control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@neststay.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          {process.env.NODE_ENV !== "production" && (
            <>
              Local demo: <strong>admin@neststay.com</strong> / <strong>admin123</strong>
              <br />
            </>
          )}
          <br />
          <Link href="/" className="mt-2 inline-block text-primary hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
