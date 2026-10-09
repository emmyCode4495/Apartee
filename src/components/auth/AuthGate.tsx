"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";

/** Blocks children until the user is signed in. Shows a sign-in panel matching Apartee UI. */
export default function AuthGate({
  children,
  message = "Sign in to continue with your booking.",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo =
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-surface" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Lock className="size-6" />
        </div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Sign in required
        </h2>
        <p className="mt-2 text-sm text-muted">{message}</p>

        <div className="mt-6 space-y-3">
          <GoogleButton redirectTo={returnTo} />
          <Link
            href={`/login?next=${encodeURIComponent(returnTo)}`}
            className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Sign in with email
          </Link>
          <p className="text-center text-sm text-muted">
            New here?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
