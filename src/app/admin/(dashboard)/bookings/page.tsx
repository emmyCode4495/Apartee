import { getBookings } from "@/lib/data";
import { formatMoney, formatMoneyRaw } from "@/lib/currency";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-surface/50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Guests</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.guestName}</p>
                    <p className="text-xs text-muted">{b.guestEmail}</p>
                    {b.guestPhone && (
                      <p className="text-xs text-muted">{b.guestPhone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-1 max-w-[200px]">
                      {b.propertyTitle || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <p>
                      {b.checkIn} → {b.checkOut}
                    </p>
                    <p className="text-xs">{b.nights} night{b.nights > 1 ? "s" : ""}</p>
                  </td>
                  <td className="px-4 py-3">{b.guests}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {formatMoney(b.totalUsd, "USD")}
                    </p>
                    {b.currency === "NGN" && (
                      <p className="text-xs text-muted">
                        Paid as{" "}
                        {b.totalDisplay != null
                          ? formatMoneyRaw(b.totalDisplay, "NGN")
                          : formatMoney(b.totalUsd, "NGN")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusSelect id={b.id} status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
