import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { formatMoney } from "@/lib/currency";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Properties",
      value: stats.totalProperties,
      sub: `${stats.publishedProperties} published`,
      icon: Building2,
      href: "/admin/properties",
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Bookings",
      value: stats.totalBookings,
      sub: `${stats.pendingBookings} pending`,
      icon: CalendarCheck,
      href: "/admin/bookings",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Revenue (USD)",
      value: formatMoney(stats.revenueUsd, "USD", { compact: true }),
      sub: `${stats.confirmedBookings} confirmed`,
      icon: DollarSign,
      href: "/admin/bookings",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Users",
      value: stats.totalUsers,
      sub: "guests & hosts",
      icon: Users,
      href: "/admin/users",
      color: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of Apartee performance
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-border bg-card p-5 card-shadow transition hover:card-shadow-hover"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <TrendingUp className="h-4 w-4 text-muted" />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm font-medium text-foreground">{c.label}</p>
            <p className="mt-0.5 text-xs text-muted">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent bookings */}
        <div className="rounded-2xl border border-border bg-card p-5 card-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent bookings</h2>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentBookings.length === 0 && (
              <p className="text-sm text-muted">No bookings yet</p>
            )}
            {stats.recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-surface/80 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{b.guestName}</p>
                  <p className="text-xs text-muted">
                    {b.propertyTitle || "Property"} · {b.checkIn}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(b.totalUsd, "USD")}
                  </p>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-border bg-card p-5 card-shadow">
          <h2 className="mb-4 font-semibold">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/properties/new"
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-surface"
            >
              <Building2 className="h-5 w-5 text-primary" />
              Add property
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-surface"
            >
              <Clock className="h-5 w-5 text-primary" />
              Review pending
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-surface"
            >
              <Users className="h-5 w-5 text-primary" />
              Manage users
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-surface"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              Currency settings
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-accent-soft p-4 text-sm">
            <p className="font-medium text-accent">Currency</p>
            <p className="mt-1 text-muted">
              Guests in Nigeria see prices in <strong>₦ Naira</strong>. Everyone
              else sees <strong>$ USD</strong>. Base rates are stored in USD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    completed: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}
