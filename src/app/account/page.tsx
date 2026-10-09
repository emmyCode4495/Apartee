"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CalendarDays, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/account");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-surface" />
      </div>
    );
  }

  const initial = (user.fullName || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Account
      </h1>
      <p className="mt-1 text-sm text-muted">Manage your profile and trips</p>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="size-16 rounded-2xl object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-2xl font-semibold text-primary">
              {initial}
            </span>
          )}
          <div>
            <p className="text-lg font-semibold">{user.fullName}</p>
            <p className="text-sm text-muted">{user.email}</p>
            {user.provider && (
              <p className="mt-1 text-xs capitalize text-muted">
                Signed in with {user.provider}
              </p>
            )}
          </div>
        </div>
      </div>

      <div id="trips" className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          <h2 className="font-semibold">My trips</h2>
        </div>
        <p className="text-sm text-muted">
          Your confirmed stays will appear here. Browse apartments to book your
          next trip.
        </p>
        <Link
          href="/listings"
          className="mt-4 inline-flex rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Explore stays
        </Link>
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-danger transition hover:bg-surface"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </div>
  );
}
