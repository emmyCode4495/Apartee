"use client";

import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BookingStatus } from "@/lib/types";

export default function BookingStatusSelect({
  id,
  status,
}: {
  id: string;
  status: BookingStatus;
}) {
  const router = useRouter();

  async function onChange(next: BookingStatus) {
    if (!isSupabaseConfigured()) {
      alert("Connect Supabase to update booking status. Demo data is read-only.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as BookingStatus)}
      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium outline-none focus:border-primary"
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
