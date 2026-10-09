import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const demoAdmin = cookieStore.get("neststay_admin")?.value === "1";

  let allowed = demoAdmin;
  const supabase = await createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role === "admin") allowed = true;
    }
  }

  if (!allowed) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </div>
    </div>
  );
}
