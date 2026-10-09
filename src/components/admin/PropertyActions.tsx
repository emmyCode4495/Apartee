"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function PropertyActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this property? This cannot be undone.")) return;

    if (!isSupabaseConfigured()) {
      alert("Connect Supabase to enable delete. Demo data is read-only.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-red-600 hover:bg-red-50"
      title="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
