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
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Sign-in failed — no user returned.");
        setLoading(false);
        return;
      }

      // 1) Read profile role
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, email")
        .eq("id", user.id)
        .maybeSingle();

      // 2) If no profile row, create one (trigger may have been missing)
      if (!profile && !profileError) {
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Admin",
            role: "guest",
          })
          .select("id, role, email")
          .maybeSingle();

        if (insertError) {
          setError(
            `Signed in, but no profile row exists and it could not be created: ${insertError.message}. ` +
              `In Supabase SQL run: insert into profiles (id, email, role) values ('${user.id}', '${user.email}', 'admin');`
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        profile = created;
      }

      if (profileError) {
        setError(
          `Could not read profile: ${profileError.message}. Check RLS policies on public.profiles.`
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const role = (profile?.role || "").toString().trim().toLowerCase();

      if (role !== "admin") {
        setError(
          `This account does not have admin access. ` +
            `Current role: “${profile?.role ?? "none"}”. ` +
            `In Supabase → Table Editor → profiles, set role to exactly: admin ` +
            `(user id: ${user.id}).`
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      document.cookie = "apartee_staff=1; path=/; max-age=86400; SameSite=Lax";
      router.push(adminPath());
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 card-shadow">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto mb-3 size-12" />
          <h1 className="text-2xl font-semibold">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted">Apatmentz control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
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
              Local demo (no Supabase):{" "}
              <strong>admin@neststay.com</strong> / <strong>admin123</strong>
              <br />
            </>
          )}
          <Link href="/" className="mt-2 inline-block text-primary hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}