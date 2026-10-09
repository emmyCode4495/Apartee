import { adminPath } from "@/lib/admin-path";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div>
      <Link
        href={adminPath("/properties")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Add property</h1>
      <PropertyForm />
    </div>
  );
}
